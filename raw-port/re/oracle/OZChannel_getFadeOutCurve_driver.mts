// OZChannel_getFadeOutCurve_driver.mts — the TypeScript half of the
// `OZChannel::getFadeOutCurve()` @ProChannel 0x15f34 differential.
//
// It imports the SHIPPED port (raw-port/src/channels/OZChannel.ts) — not a restatement of it — so
// the number this prints is a property of the file under review. Run through the repo's `tsx`
// (raw-port/node_modules/.bin/tsx), which elides the corpus's type-only value imports; plain
// `node --experimental-strip-types` cannot load this graph, because
// `raw-port/src/infra/PCSerializerReadStream.ts` imports the TYPE `CMTime` with a value import and
// type stripping leaves that import in place (measured 2026-08-11, ProChannel 0x15f34 unit).
//
// Usage:  tsx OZChannel_getFadeOutCurve_driver.mts <cases.json>
//   cases.json : [ { "x": <u32 decoy at +0x30>, "y": <u32 at +0x34>, "nullSaved": <bool> }, ... ]
//   stdout     : { "port": [...], "mutants": { "M0": [...], ... } }, one entry per case, each
//                either { "v": <number> } or { "throw": "<message>" }.
//
// The mutants live in THIS process, so they are apples-to-apples with the port (the house rule from
// the SurroundPanner harness), and M0 is an unmutated restatement whose job is to score 0 kills: it
// proves the mutation pipeline itself perturbs nothing.
import { readFileSync } from "node:fs";
import {
  OZChannel_getFadeOutCurve,
  type OZChannelLayout,
} from "../../src/channels/OZChannel.ts";
import type { OZChannelImplSavedState } from "../../src/channels/OZChannelImpl.ts";

interface Case {
  x: number;
  y: number;
  nullSaved: boolean;
}

const ZERO_TIME = { value: 0n, timescale: 0, flags: 0, epoch: 0n };

function build(c: Case): OZChannelLayout {
  const saved: OZChannelImplSavedState | null = c.nullSaved
    ? null
    : ({
        timeA: { ...ZERO_TIME },
        timeB: { ...ZERO_TIME },
        x: c.x,
        y: c.y,
      } as unknown as OZChannelImplSavedState);
  // The impl object is shaped like the LANDED OZChannelImpl class (curve +0x08, savedState +0x10),
  // which is the model the port reads through.
  const impl = { curve: null, savedState: saved };
  // `this+0x78` (implSecondary) gets a DISTINCT object carrying a sentinel, mirroring the
  // 0xCCCC… planted at +0x78 by the probe: the machine never reads it, so a port that starts its
  // chain at the wrong slot must produce a different number rather than the same one (M5).
  const implSecondary = {
    curve: null,
    savedState: { timeA: { ...ZERO_TIME }, timeB: { ...ZERO_TIME }, x: 0x5a5a5a5a, y: 0x5a5a5a5a },
  };
  return { implPrimary: impl, implSecondary } as unknown as OZChannelLayout;
}

type Answer = { v: number } | { throw: string };

function run(fn: (self: OZChannelLayout) => number, cases: Case[]): Answer[] {
  return cases.map((c) => {
    try {
      return { v: fn(build(c)) };
    } catch (e) {
      return { throw: String((e as Error).message ?? e) };
    }
  });
}

// ---- mutants (each is the port with exactly one instruction re-decoded wrongly) ----------------
type Impl = { savedState: { x: number; y: number } | null };

// M0 — unmutated restatement. MUST kill 0; a non-zero score here means the mutation pipeline (the
// hand-built object, not the port) is what the differential is measuring.
function M0(self: OZChannelLayout): number {
  const impl = self.implPrimary as unknown as Impl;
  const saved = impl.savedState;
  if (saved === null || saved === undefined) return 0;
  return saved.y;
}
// M1 — `movl 0x34(%rax)` misread as `0x30`: returns the fade-IN curve id instead. This is the
// defect the +0x30 decoy exists to catch.
function M1(self: OZChannelLayout): number {
  const impl = self.implPrimary as unknown as Impl;
  const saved = impl.savedState;
  if (saved === null || saved === undefined) return 0;
  return saved.x;
}
// M2 — the `testq %rax,%rax ; je` at 0x15f40-0x15f43 dropped: no NULL path.
function M2(self: OZChannelLayout): number {
  const impl = self.implPrimary as unknown as Impl;
  return (impl.savedState as { y: number }).y;
}
// M3 — the 4-byte load read as SIGNED (`movslq`), which only differs above 0x7fffffff.
function M3(self: OZChannelLayout): number {
  const impl = self.implPrimary as unknown as Impl;
  const saved = impl.savedState;
  if (saved === null || saved === undefined) return 0;
  return saved.y | 0;
}
// M4 — the NULL answer written as -1 instead of the `xorl %eax,%eax` zero at 0x15f4a.
function M4(self: OZChannelLayout): number {
  const impl = self.implPrimary as unknown as Impl;
  const saved = impl.savedState;
  if (saved === null || saved === undefined) return -1;
  return saved.y;
}
// M5 — the chain started at `this+0x78` (implSecondary) instead of `+0x70`. Killed only by a corpus
// that makes the two slots differ, which is why the probe plants a distinct object in +0x78.
function M5(self: OZChannelLayout): number {
  const impl = self.implSecondary as unknown as Impl;
  const saved = impl.savedState;
  if (saved === null || saved === undefined) return 0;
  return saved.y;
}

const cases = JSON.parse(readFileSync(process.argv[2], "utf8")) as Case[];
process.stdout.write(
  JSON.stringify({
    port: run(OZChannel_getFadeOutCurve, cases),
    mutants: {
      M0: run(M0, cases),
      M1: run(M1, cases),
      M2: run(M2, cases),
      M3: run(M3, cases),
      M4: run(M4, cases),
      M5: run(M5, cases),
    },
  }),
);
