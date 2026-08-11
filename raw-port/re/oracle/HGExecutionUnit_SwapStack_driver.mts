// TS half of the differential for HGExecutionUnit::SwapStack @Helium 0x144570. Imports the REAL
// port and calls the REAL method; the mutants run in this same process on the same cases.
const portHref =
  process.env.HGEXECUTIONUNIT_TS !== undefined
    ? new URL(`file://${process.env.HGEXECUTIONUNIT_TS}`).href
    : new URL("../../src/render/HGExecutionUnit.ts", import.meta.url).href;
const { HGExecutionUnit } = (await import(portHref)) as {
  HGExecutionUnit: new () => { state: { stackIndex: number } | null; SwapStack: () => void };
};

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const cases: number[] = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const port = cases.map((v) => {
    const u = new HGExecutionUnit();
    u.state = { stackIndex: v };
    u.SwapStack();
    return u.state.stackIndex | 0;
  });
  // The two models that agree with the machine on {0,1} and disagree everywhere else — the whole
  // reason the corpus is not {0,1} — plus one that writes the answer to the wrong object.
  const xorToggle = cases.map((v) => (v ^ 1) | 0);
  const oneMinus = cases.map((v) => (1 - v) | 0);
  const wrongTarget = cases.map((v) => v | 0);   // stores into the receiver, pointee unchanged
  process.stdout.write(
    JSON.stringify({
      port,
      mutants: [
        { name: "M1 x ^= 1 (a bitwise toggle)", values: xorToggle },
        { name: "M2 x = 1 - x", values: oneMinus },
        { name: "M3 stores into the receiver, not the pointee", values: wrongTarget },
      ],
    }),
  );
});
