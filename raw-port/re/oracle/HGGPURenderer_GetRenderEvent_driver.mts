// HGGPURenderer_GetRenderEvent_driver.mts — the TypeScript side of the differential for
// `HGGPURenderer::GetRenderEvent()` @Helium 0x11eb0.
//
// It imports the REAL ported class; no restatement of the port lives here or in the Python oracle.
// A JS object reference has no bit pattern, so the comparable observation is WHICH SLOT the value
// came from: the oracle plants a distinct value in each modelled field of the live arena and this
// driver plants a distinct object in each modelled field of a real HGGPURenderer, and both report
// the slot the getter answered from.
//
// Protocol: JSON request on stdin, JSON reply on stdout.
//   in : {"cases":[{"name":…,"renderEventNull":bool}, …]}
//   out: {"port":["<slot tag>", …], "mutants":{"<name>":["<slot tag>", …], …}}
// Slot tags: "null" | "+0x530" | "+0x520" | "+0x458" | "other".
//
// Run by raw-port/re/oracle/HGGPURenderer_GetRenderEvent_oracle.py via
// raw-port/node_modules/.bin/tsx.
import { HGGPURenderer } from "../../src/render/HGGPURenderer.ts";
import type { HGMetalContext, HGMetalHandler } from "../../src/render/HGGPURenderer.ts";
import { HGMetalSharedEvent } from "../../src/render/HGMetalSharedEvent.ts";

interface Case {
  name: string;
  renderEventNull: boolean;
}

const req = JSON.parse(await new Promise<string>((resolve, reject) => {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (buf += d));
  process.stdin.on("end", () => resolve(buf));
  process.stdin.on("error", reject);
})) as { cases: Case[] };

/** One renderer with a DISTINCT object in each modelled slot — the TS counterpart of the arena the
 *  oracle fills with one distinct sentinel per slot. */
function setup(c: Case): {
  r: HGGPURenderer;
  atRenderEvent: HGMetalSharedEvent | null;
  atMetalHandler: HGMetalHandler;
  atMetalContext: HGMetalContext;
} {
  const r = new HGGPURenderer();
  const atRenderEvent = c.renderEventNull ? null : new HGMetalSharedEvent();
  // The two opaque pointees above this slot are branded interfaces with no runtime shape; a plain
  // tagged object stands in for the pointer identity, which is all this differential compares.
  const atMetalHandler = { __slot: "+0x520" } as unknown as HGMetalHandler;
  const atMetalContext = { __slot: "+0x458" } as unknown as HGMetalContext;
  r.renderEvent_at_0x530 = atRenderEvent;
  r.metalHandler_at_0x520 = atMetalHandler;
  r.metalContext_at_0x458 = atMetalContext;
  return { r, atRenderEvent, atMetalHandler, atMetalContext };
}

function tagOf(v: unknown, s: ReturnType<typeof setup>): string {
  if (v === null || v === undefined) return "null";
  if (v === s.atRenderEvent) return "+0x530";
  if (v === (s.atMetalHandler as unknown)) return "+0x520";
  if (v === (s.atMetalContext as unknown)) return "+0x458";
  return "other";
}

type Run = (s: ReturnType<typeof setup>) => unknown;

const port: string[] = req.cases.map((c) => {
  const s = setup(c);
  return tagOf(s.r.GetRenderEvent(), s);
});

// ---- negative controls, evaluated in this same process on the same cases ----
const mutants: Record<string, Run> = {
  // `movq 0x520(%rdi)` — the neighbouring HGMetalHandler slot.
  reads_0x520: (s) => s.r.metalHandler_at_0x520,
  // `movq 0x458(%rdi)` — the HGMetalContext slot.
  reads_0x458: (s) => s.r.metalContext_at_0x458,
  // an invented null guard / "safe" default.
  always_null: () => null,
  // fabricating an event instead of returning the stored one (identity lost).
  fabricates: () => new HGMetalSharedEvent(),
  // returning something derived from the event rather than the pointer itself.
  returns_other: (s) => (s.atRenderEvent === null ? null : { copyOf: "+0x530" }),
};

const out: Record<string, string[]> = {};
for (const [name, run] of Object.entries(mutants)) {
  out[name] = req.cases.map((c) => {
    const s = setup(c);
    return tagOf(run(s), s);
  });
}

process.stdout.write(JSON.stringify({ port, mutants: out }));
