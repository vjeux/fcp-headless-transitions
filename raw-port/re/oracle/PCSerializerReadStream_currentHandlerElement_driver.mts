// PCSerializerReadStream_currentHandlerElement_driver.mts — the TS half of the differential for
// `PCSerializerReadStream::currentHandlerElement() const` @ProCore 0x264f6.
//
// Run by PCSerializerReadStream_currentHandlerElement_oracle.py as
//   node --experimental-strip-types PCSerializerReadStream_currentHandlerElement_driver.mts [module]
// with the corpus on stdin and the results on stdout.
//
// It imports the REAL ported file and calls the REAL exported function — a Python restatement of
// the port would share any misreading of the disassembly with the port itself, which is the whole
// failure this driver exists to avoid (66 of 117 oracles on main never load the .ts at all).
// The optional argument names a MUTATED copy of that same file, so the negative controls measure
// the port's own source with one edit rather than a hand-written model of it.
import { register } from "node:module";
register("./ts_js_hooks.mjs", import.meta.url);   // NodeNext `.js` specifiers -> the .ts beside them

const modArg = process.argv[2];
const portHref =
  modArg !== undefined && modArg !== ""
    ? new URL(`file://${modArg}`).href
    : new URL("../../src/infra/PCSerializerReadStream.ts", import.meta.url).href;

// Dynamic import, AFTER register() — a static import is resolved before the hook is live.
const mod = (await import(portHref)) as {
  PCSerializerReadStream: new () => {
    _handlersMap: unknown[][];
    _handlersStart: number;
    _handlersSize: number;
    currentHandlerElement: () => { __sentinel?: string } | null;
  };
};
const { PCSerializerReadStream } = mod;

type Case = { start: number; size: number; nblocks: number };

// The SAME synthetic content the oracle writes into real memory: the HandlerInfo at global index g
// (block g/102, offset g%102) carries element pointer ELEM_BASE+g and handler pointer HAND_BASE+g.
// Both sides build it from the case description rather than shipping the table, so the two cannot
// disagree about what was in memory — and the handler pointer differs from the element pointer so
// that a port reading +0x18 instead of +0x20 is a divergence rather than a coincidence.
const ELEM_BASE = 0x2000000000n;
const HAND_BASE = 0x3000000000n;
const PER_BLOCK = 102;

function buildStream(c: Case) {
  const mapBegin: unknown[][] = [];
  for (let b = 0; b < c.nblocks; b++) {
    const block: unknown[] = [];
    for (let o = 0; o < PER_BLOCK; o++) {
      const g = BigInt(b * PER_BLOCK + o);
      block.push({
        ownedAt00: null,
        fieldAt08: null,
        fieldAt10: null,
        handler: { __sentinel: "0x" + (HAND_BASE + g).toString(16) },
        element: { __sentinel: "0x" + (ELEM_BASE + g).toString(16) },
      });
    }
    mapBegin.push(block);
  }
  // The three words the method loads, set on a REAL instance of the ported class — the façade
  // fields the class also carries (version, timescale, factories) are untouched and unread here.
  const s = new PCSerializerReadStream();
  s._handlersMap = mapBegin;
  s._handlersStart = c.start;
  s._handlersSize = c.size;
  return s;
}

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const { cases } = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { cases: Case[] };
  const values: (string | null)[] = [];
  const errors: (string | null)[] = [];
  for (const c of cases) {
    try {
      const r = buildStream(c).currentHandlerElement();
      // A pointer crosses as a HEX STRING, never a JSON number: this repo has lost the low byte of
      // an int64 to JSON rounding more than once, and the symptom reads as a small, plausible
      // defect IN THE PORT.
      values.push(r === null || r === undefined ? null : (r.__sentinel ?? "UNKNOWN_OBJECT"));
      errors.push(null);
    } catch (e) {
      // An out-of-range index throws in TS where the machine reads whatever follows the map. That
      // is a REAL difference and must be reported as one, not swallowed into a null.
      values.push(null);
      errors.push(String(e).slice(0, 120));
    }
  }
  process.stdout.write(JSON.stringify({ values, errors }));
});
