// PCSerializerReadStream_processElement_driver.mts — the TypeScript side of the
// differential for `PCSerializerReadStream::processElement(PCStreamElement&)`
// @ProCore 0x2681c.
//
// It imports the REAL ported classes; no restatement of the port lives here or
// in the Python oracle. The oracle drives the LIVE function over arenas with a
// synthetic vtable and records, for each scenario, an OBSERVATION — what the
// function returned, what the element's +0xc byte became, which vtable slot was
// entered, and which value arrived in each argument register. This driver
// produces the same observation shape from the TypeScript, so the two can be
// compared directly.
//
// Protocol: JSON request on stdin, JSON reply on stdout.
//   in : {"scenarios":[{"name":…,"hasTarget":bool,"calleeReturns":0|1}, …]}
//   out: {"port":[Observation,…], "mutants":{"<name>":[Observation,…], …}}
// An Observation is {ret, flag, callee, a1, a2, a3, calls} where `callee` is
// the vtable slot entered ("slot7", or "none" when nothing was dispatched) and
// a1/a2/a3 are tags: "target" | "stream" | "element" | "-".
//
// Run by raw-port/re/oracle/PCSerializerReadStream_processElement_oracle.py via
// raw-port/node_modules/.bin/tsx (tsx rather than plain node type-stripping,
// because the ported sources import their siblings through `.js` specifiers).
import { PCSerializerReadStream } from "../../src/infra/PCSerializerReadStream.ts";
import type { PCSerializerParseTarget } from "../../src/infra/PCSerializerReadStream.ts";
import { PCStreamElement } from "../../src/infra/PCStreamElement.ts";

interface Scenario {
  name: string;
  hasTarget: boolean;
  calleeReturns: 0 | 1;
}

interface Observation {
  ret: number;
  flag: number;
  callee: string;
  a1: string;
  a2: string;
  a3: string;
  calls: number;
}

const req = JSON.parse(await new Promise<string>((resolve, reject) => {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (buf += d));
  process.stdin.on("end", () => resolve(buf));
  process.stdin.on("error", reject);
})) as { scenarios: Scenario[] };

/** A recording stand-in for whatever PCSerializer subclass owns the element:
 *  the TS counterpart of the synthetic vtable the oracle installs. Its
 *  `parseElement` is vtable slot 7. */
class RecordingTarget implements PCSerializerParseTarget {
  calls = 0;
  callee = "none";
  a1 = "-";
  a2 = "-";
  a3 = "-";
  constructor(private readonly ret: 0 | 1, private readonly slotTag = "slot7") {}
  parseElement(stream: PCSerializerReadStream, element: PCStreamElement): boolean {
    this.calls += 1;
    this.callee = this.slotTag;
    this.a1 = "target";                       // the receiver (%rdi)
    this.a2 = tag(stream, this, element);     // %rsi
    this.a3 = tag(element, this, element);    // %rdx
    return this.ret === 1;
  }
  /** Slot 6 — `parseEnd` — so a mutant that dispatches one slot low is visible. */
  parseEndSlot6(stream: PCSerializerReadStream, element: PCStreamElement): boolean {
    this.calls += 1;
    this.callee = "slot6";
    this.a1 = "target";
    this.a2 = tag(stream, this, element);
    this.a3 = tag(element, this, element);
    return this.ret === 1;
  }
}

function tag(v: unknown, target: unknown, element: unknown): string {
  if (v === target) return "target";
  if (v === element) return "element";
  if (v instanceof PCSerializerReadStream) return "stream";
  return "?";
}

/** Build one scenario's objects: a stream, an element, and (optionally) the
 *  target hanging off the element's +0x18 slot. */
function setup(s: Scenario): {
  stream: PCSerializerReadStream;
  element: PCStreamElement;
  target: RecordingTarget | null;
} {
  const stream = new PCSerializerReadStream();
  const element = new PCStreamElement("element", "OZChannelBaseScope", 0x6f);
  const target = s.hasTarget ? new RecordingTarget(s.calleeReturns) : null;
  element.serializerAt0x18 = target;
  element.processedFlagAt0xc = 0; // the ctor's `movb %al, 0xc(%rdi)` @0x286f3
  return { stream, element, target };
}

function observe(
  s: Scenario,
  run: (
    stream: PCSerializerReadStream,
    element: PCStreamElement,
    target: RecordingTarget | null,
  ) => boolean,
): Observation {
  const { stream, element, target } = setup(s);
  const ret = run(stream, element, target) ? 1 : 0;
  return {
    ret,
    flag: element.processedFlagAt0xc,
    callee: target ? target.callee : "none",
    a1: target ? target.a1 : "-",
    a2: target ? target.a2 : "-",
    a3: target ? target.a3 : "-",
    calls: target ? target.calls : 0,
  };
}

// ---- the port itself --------------------------------------------------
const port = req.scenarios.map((s) =>
  observe(s, (stream, element) => stream.processElement(element))
);

// ---- negative controls, evaluated in this same process ----------------
type Run = (
  stream: PCSerializerReadStream,
  element: PCStreamElement,
  target: RecordingTarget | null,
) => boolean;

const mutants: Record<string, Run> = {
  // The NULL path answers true instead of `xorl %eax,%eax`.
  true_on_null: (st, e) => {
    const t = e.serializerAt0x18 as RecordingTarget | null;
    if (t === null) return true;
    e.processedFlagAt0xc = 1;
    return t.parseElement(st, e);
  },
  // The `movb $0x1, 0xc(%rdx)` @0x2682f is dropped.
  flag_never_set: (st, e) => {
    const t = e.serializerAt0x18 as RecordingTarget | null;
    if (t === null) return false;
    return t.parseElement(st, e);
  },
  // The flag is set even on the NULL path (the store hoisted above the branch).
  flag_set_on_null: (st, e) => {
    const t = e.serializerAt0x18 as RecordingTarget | null;
    e.processedFlagAt0xc = 1;
    if (t === null) return false;
    return t.parseElement(st, e);
  },
  // The two forwarded arguments swapped — the shuffle at 0x26820/0x26823 read
  // backwards.
  args_swapped: (st, e) => {
    const t = e.serializerAt0x18 as RecordingTarget | null;
    if (t === null) return false;
    e.processedFlagAt0xc = 1;
    // deliberately wrong order: (element, stream)
    return t.parseElement(e as unknown as PCSerializerReadStream,
                          st as unknown as PCStreamElement);
  },
  // The receiver forwarded where the stream belongs.
  receiver_as_stream: (st, e) => {
    const t = e.serializerAt0x18 as RecordingTarget | null;
    if (t === null) return false;
    e.processedFlagAt0xc = 1;
    return t.parseElement(t as unknown as PCSerializerReadStream, e);
  },
  // The tail-jmp treated as a call whose result is discarded.
  return_ignored: (st, e) => {
    const t = e.serializerAt0x18 as RecordingTarget | null;
    if (t === null) return false;
    e.processedFlagAt0xc = 1;
    t.parseElement(st, e);
    return true;
  },
  // vptr+0x30 instead of vptr+0x38 — one slot low, i.e. parseEnd.
  slot6_not_slot7: (st, e) => {
    const t = e.serializerAt0x18 as RecordingTarget | null;
    if (t === null) return false;
    e.processedFlagAt0xc = 1;
    return t.parseEndSlot6(st, e);
  },
};

const out: Record<string, Observation[]> = {};
for (const [name, run] of Object.entries(mutants)) {
  out[name] = req.scenarios.map((s) => observe(s, run));
}

process.stdout.write(JSON.stringify({ port, mutants: out }));
