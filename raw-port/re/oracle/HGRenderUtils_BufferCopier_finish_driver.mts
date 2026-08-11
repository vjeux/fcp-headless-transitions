// HGRenderUtils_BufferCopier_finish_driver.mts — the TS half of the finish()
// differential.  Run by HGRenderUtils_BufferCopier_finish_oracle.py as
//   node --experimental-strip-types HGRenderUtils_BufferCopier_finish_driver.mts
// reading the case list as JSON on stdin and writing JSON on stdout.
//
// WHY THIS FILE EXISTS: the first version of this oracle compared the live
// symbol against a PYTHON restatement of the port (`ts_port`, called with
// `wait=lambda g: None`).  That model no-op'd the wait; the shipped TypeScript
// threw in it.  So 1,004 cases and three negative controls all attested to
// something that was not the code under review, and a real divergence — the
// flag never being cleared — was invisible.  This driver imports the REAL
// port file and calls the REAL method, so the comparison is against what
// would land.
const portHref =
  process.env.BUFFERCOPIER_TS !== undefined
    ? new URL(`file://${process.env.BUFFERCOPIER_TS}`).href
    : new URL("../../src/render/HGRenderUtils_BufferCopier.ts", import.meta.url).href;
const { HGRenderUtils_BufferCopier, BufferCopierImpl } = (await import(portHref)) as {
  HGRenderUtils_BufferCopier: new () => {
    pImpl: unknown;
    finish: () => void;
  };
  BufferCopierImpl: new () => { group: unknown; flag_0x48: number };
};

type Row = { flag: number; threw: boolean; groupIntact: boolean };

const GROUP = { __brand: "dispatch_group_t" } as const;

/** Run the SHIPPED method on a mirror of the poisoned Impl the live side uses. */
function runPort(flag: number): Row {
  const self = new HGRenderUtils_BufferCopier();
  const impl = new BufferCopierImpl();
  impl.group = GROUP;
  impl.flag_0x48 = flag;
  self.pImpl = impl;
  let threw = false;
  try {
    self.finish();
  } catch {
    threw = true;
  }
  return { flag: impl.flag_0x48, threw, groupIntact: impl.group === GROUP };
}

// ---------------------------------------------------------------------------
// Mutants — deliberate misreadings of @Helium 0x603b0, evaluated in THIS
// process on THE SAME inputs so their kill counts are comparable with the
// port's divergence count.
// ---------------------------------------------------------------------------
type Model = (flag: number) => Row;

// M1 is the body this PR was rejected for: the wait modelled as a throw, so
// the @0x603ce store is unreachable and the flag survives on the only path
// that does anything.
const m1_waitThrows: Model = (flag) => {
  let f = flag;
  let threw = false;
  try {
    if (f === 1) {
      throw new Error("_dispatch_group_wait not yet transcribed");
      // unreachable: f = 0;
    }
  } catch {
    threw = true;
  }
  return { flag: f, threw, groupIntact: true };
};

// M2: `cmpb $0x1` @0x603b9 read as a zero test — any non-zero flag waits.
const m2_nonZeroTest: Model = (flag) => ({
  flag: flag !== 0 ? 0 : flag, threw: false, groupIntact: true,
});

// M3: the @0x603ce store dropped.
const m3_dropsStore: Model = (flag) => ({ flag, threw: false, groupIntact: true });

// M4: the `jne` @0x603bd inverted — clear the flag unconditionally.
const m4_clearsAlways: Model = () => ({ flag: 0, threw: false, groupIntact: true });

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const flags: number[] = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  process.stdout.write(
    JSON.stringify({
      port: flags.map(runPort),
      mutants: [
        { name: "M1 the wait throws (the rejected body)", results: flags.map(m1_waitThrows) },
        { name: "M2 flag != 0 instead of cmpb $0x1", results: flags.map(m2_nonZeroTest) },
        { name: "M3 drops the 0x603ce store", results: flags.map(m3_dropsStore) },
        { name: "M4 jne inverted: clears unconditionally", results: flags.map(m4_clearsAlways) },
      ],
    }),
  );
});
