// Driver for PCSerializerReadStream_currentElement_oracle.py — replays the oracle's structural
// shapes through the REAL port and prints the returned element's sentinel address as JSON.
//
//   echo '<cases>' | node --experimental-strip-types PCSerializerReadStream_currentElement_driver.mts
//   echo '<cases>' | node --experimental-strip-types … --mutants     # the negative controls
//
// Each block slot holds a sentinel carrying the SAME value the C side wrote into that slot
// (0x5EED0000 + physical index, or 0 for a deliberate NULL), so comparing the port's answer with
// the live function's is a value comparison, not a shape comparison.
//
// The port imports PCStreamElement/CMTime, so this driver uses the repo's `.js`-specifier resolve
// hook and a DYNAMIC import (a static import is resolved before the hook is live).
import { register } from "node:module";
register("./ts_js_hooks.mjs", import.meta.url);

type Case = { start: number; size: number; nullAt: number | null; block: number };

const raw = await new Promise<string>((resolve) => {
  let s = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (s += d));
  process.stdin.on("end", () => resolve(s));
});
const cases: Case[] = JSON.parse(raw);

const mod = await import("../../src/infra/PCSerializerReadStream.ts");
const { PCSerializerReadStream } = mod as {
  PCSerializerReadStream: new () => {
    _elementsMap: Array<Array<unknown>>;
    _elementsStart: number;
    _elementsSize: number;
    currentElement(): unknown;
  };
};

/** A stand-in for PCStreamElement carrying the pointer value the C side stored in the same slot. */
class Sentinel {
  // NOTE: a plain field + assignment, NOT a `constructor(public addr: number)` parameter property —
  // node's type STRIPPING refuses that syntax (ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX), because it would
  // have to emit code rather than erase types. Worth knowing before writing any driver this way.
  addr: number;
  constructor(addr: number) {
    this.addr = addr;
  }
}

function build(c: Case) {
  const s = new PCSerializerReadStream();
  // SPARSE map, mirroring the C side: only the block the method can reach is materialised, and it
  // is placed at its real index. A dense map for the >2^32 cases would be millions of entries on
  // both sides for one 8-byte load. Every slot carries the sentinel value the C block holds at the
  // same physical index, so the two sides are comparable by VALUE.
  const map: Array<Array<unknown>> = [];
  if (c.size > 0) {
    const idx = c.size + c.start - 1;
    const block = Math.floor(idx / c.block);
    const blk: Array<unknown> = [];
    for (let i = 0; i < c.block; i++) {
      const phys = block * c.block + i;
      blk.push(c.nullAt === phys ? null : new Sentinel(0x5eed0000 + phys));
    }
    map[block] = blk;
  }
  s._elementsMap = map;
  s._elementsStart = c.start;
  s._elementsSize = c.size;
  return s;
}

function addrOf(v: unknown): number {
  return v instanceof Sentinel ? v.addr : 0; // null / nullptr both read as 0, as the C side does
}

if (process.argv.includes("--mutants")) {
  // Three plausible mis-transcriptions of THIS function, evaluated in the same process on the same
  // corpus. If the corpus cannot separate one of them from the port, the corpus is too weak and the
  // oracle says so rather than reporting a clean pass.
  const out: Record<string, number[]> = {
    // forgets __start_ (`addq %rdx,%rax` @0x2648f dropped)
    "ignores __start_": [],
    // returns the FIRST element instead of the last (`decq %rax` @0x26492 dropped, no +size)
    "front instead of back": [],
    // 32-bit shift/mask written as `>>> 9` / `& 0x1ff`, which is what a natural transcription of
    // `shrq $0x9` / `andl $0x1ff` looks like. It agrees with the port for every index below 2^32,
    // which is why the corpus carries four cases above it.
    "32-bit shift and mask": [],
  };
  for (const c of cases) {
    const s = build(c);
    const map = s._elementsMap;
    if (c.size === 0) {
      out["ignores __start_"]!.push(0);
      out["front instead of back"]!.push(0);
      out["32-bit shift and mask"]!.push(0);
      continue;
    }
    const read = (i: number): number => {
      const blk = map[Math.floor(i / 512)];
      return blk === undefined ? -1 : addrOf(blk[i % 512]);   // -1 = "would have faulted"
    };
    out["ignores __start_"]!.push(read(c.size - 1));
    out["front instead of back"]!.push(read(c.start));
    const idx = c.size + c.start - 1;
    const blk32 = map[idx >>> 9];
    out["32-bit shift and mask"]!.push(blk32 === undefined ? -1 : addrOf(blk32[idx & 0x1ff]));
  }
  console.log(JSON.stringify(out));
} else {
  console.log(JSON.stringify(cases.map((c) => addrOf(build(c).currentElement()))));
}
