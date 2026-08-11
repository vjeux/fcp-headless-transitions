// HGString_destroy_driver.mts — the TS half of the HGString::~HGString [D1]
// differential.  Run by HGString_destroy_oracle.py as
//   node --experimental-strip-types HGString_destroy_driver.mts
// reading the case list as JSON on stdin, writing JSON on stdout.
//
// It imports the REAL port rather than restating it, and evaluates the port
// plus four mutants in ONE process on the SAME cases, so the control numbers
// are apples-to-apples with the port's.
//
// The JS mirror of the receiver is an object with the same four slots the
// binary arena has; "freed" is not observable in a GC runtime, which is
// precisely what the no-op deallocation boundary models — the live side
// measures that half with malloc_size.
const portHref =
  process.env.HGSTRING_TS !== undefined
    ? new URL(`file://${process.env.HGSTRING_TS}`).href
    : new URL("../../src/render/HGString.ts", import.meta.url).href;
const { HGString_destroy } = (await import(portHref)) as {
  HGString_destroy: (self: Record<string, unknown>) => void;
};

type Case = { name: string; alloc: boolean; rc: number; extra: boolean };
type Row = {
  case: string;
  refCountAfter: number | null;
  extraEndIsBegin: boolean;
  allocStillPointed: boolean;
  extraBeginStillPointed: boolean;
  threw: boolean;
  strayFields: number;
};

const XB = { __brand: "HGString::extraBlock" } as const;

function mkSelf(c: Case): Record<string, unknown> {
  const base = { bytes: new Uint8Array(32), index: 0 };
  return {
    buf: null,
    length: 0,
    alloc: c.alloc ? { cap: 32, refCount: c.rc, base } : null,
    extraBegin: c.extra ? XB : null,
    extraEnd: null,
  };
}

// The live side's "freed" cases cannot read the record back, so the row hides
// refCount exactly where the binary does — otherwise the comparison would be
// asking the two sides different questions.
function row(c: Case, self: Record<string, unknown>, threw: boolean): Row {
  const alloc = self.alloc as { refCount: number } | null;
  const hidden = alloc !== null && alloc.refCount === 0;
  return {
    case: c.name,
    refCountAfter: alloc === null || hidden ? null : alloc.refCount,
    extraEndIsBegin: c.extra && self.extraEnd === XB,
    allocStillPointed: (self.alloc === null) === !c.alloc,
    extraBeginStillPointed: (self.extraBegin === null) === !c.extra,
    threw,
    strayFields: self.buf === null && self.length === 0 ? 0 : 1,
  };
}

function runPort(c: Case): Row {
  const self = mkSelf(c);
  let threw = false;
  try {
    HGString_destroy(self);
  } catch {
    threw = true;
  }
  return row(c, self, threw);
}

// ---------------------------------------------------------------------------
// Mutants — deliberate misreadings of @Helium 0xb7990.
// ---------------------------------------------------------------------------
type Model = (c: Case) => Row;

// M1: the body this PR was rejected for — both deallocators throw, so the
// refcount-zero path and the extra-block path raise instead of destructing.
const m1_throwingDeallocators: Model = (c) => {
  const self = mkSelf(c);
  let threw = false;
  try {
    const alloc = self.alloc as { refCount: number } | null;
    if (alloc !== null) {
      alloc.refCount -= 1;
      if (alloc.refCount === 0) throw new Error("_free not modelled");
    }
    if (self.extraBegin !== null) {
      self.extraEnd = self.extraBegin;
      throw new Error("__ZdlPv not modelled");
    }
  } catch {
    threw = true;
  }
  return row(c, self, threw);
};

// M2: `je 0xb79c0` @0xb79a6 read with inverted polarity — release while other
// owners remain, keep the storage when the last owner leaves.
const m2_invertedZeroTest: Model = (c) => {
  const self = mkSelf(c);
  const alloc = self.alloc as { refCount: number } | null;
  if (alloc !== null) alloc.refCount -= 1;
  if (self.extraBegin !== null) self.extraEnd = self.extraBegin;
  // This mutant kills 0 cases and it is EQUIVALENT, not blind: with the
  // deallocators modelled as no-ops, WHICH branch of the zero-test runs has no
  // JS-observable consequence at all. The polarity is not therefore untested —
  // it is pinned on the LIVE side instead, by the malloc_size column the oracle
  // prints: `refcount 2 survives` shows freed=False and `refcount 1 -> free`
  // shows freed=True, and an inverted `je` @0xb79a6 would swap exactly those.
  return row(c, self, false);
};

// M3: the @0xb79b1 store dropped — `__end_` left as it was.
const m3_dropsEndStore: Model = (c) => {
  const self = mkSelf(c);
  const alloc = self.alloc as { refCount: number } | null;
  if (alloc !== null) alloc.refCount -= 1;
  return row(c, self, false);
};

// M4: the back-edge @0xb79d9 missed — the extra block is only released when
// the refcount SURVIVED, so `free + extra` loses its `__end_` store.
const m4_missesBackEdge: Model = (c) => {
  const self = mkSelf(c);
  const alloc = self.alloc as { refCount: number } | null;
  let zeroed = false;
  if (alloc !== null) {
    alloc.refCount -= 1;
    zeroed = alloc.refCount === 0;
  }
  if (!zeroed && self.extraBegin !== null) self.extraEnd = self.extraBegin;
  return row(c, self, false);
};

// M5: the decrement dropped (a `movq` read where the machine has `decq`).
const m5_dropsDecrement: Model = (c) => {
  const self = mkSelf(c);
  if (self.extraBegin !== null) self.extraEnd = self.extraBegin;
  return row(c, self, false);
};

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const cases: Case[] = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  process.stdout.write(
    JSON.stringify({
      port: cases.map(runPort),
      mutants: [
        { name: "M1 deallocators throw (the rejected body)", results: cases.map(m1_throwingDeallocators) },
        { name: "M2 zero-test polarity inverted", results: cases.map(m2_invertedZeroTest) },
        { name: "M3 drops the 0xb79b1 __end_ store", results: cases.map(m3_dropsEndStore) },
        { name: "M4 misses the 0xb79d9 back-edge", results: cases.map(m4_missesBackEdge) },
        { name: "M5 drops the 0xb79a2 decrement", results: cases.map(m5_dropsDecrement) },
      ],
    }),
  );
});
