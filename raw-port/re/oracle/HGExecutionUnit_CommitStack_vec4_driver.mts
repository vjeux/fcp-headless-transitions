// TS half of the differential for
// HGExecutionUnit::CommitStack(float vector[4]*, unsigned long) @Helium 0x1445b0.
//
// Not part of the port (tsconfig includes src/** only). Driven by
// raw-port/re/oracle/HGExecutionUnit_CommitStack_vec4_oracle.py, which calls the REAL symbol on a
// ctypes arena and matches the count this driver reports against the bytes the live call left
// behind. It exists so the wrap cases are a differential against the SHIPPED port rather than a
// restatement of the disassembly: the divergence the reviewer of PR #585 measured (a top computed
// with unbounded bigint arithmetic) is invisible to a live-versus-model harness, because the model
// and the machine agree — it is the port that differs.
//
// Every 64-bit quantity crosses as a HEX STRING. A u64 does not survive JSON's double (2^60 and
// 2^64-1 both round), and the top of the range is the entire point of these cases.
const portHref =
  process.env.HGEXECUTIONUNIT_TS !== undefined
    ? new URL(`file://${process.env.HGEXECUTIONUNIT_TS}`).href
    : new URL("../../src/render/HGExecutionUnit.ts", import.meta.url).href;
const { HGExecutionUnit } = (await import(portHref)) as { HGExecutionUnit: new () => any };

type Case = {
  label: string;
  index: number;
  base: string;
  count: string;
  other: string;
  n: string;
  ptr: string;
};
const hex = (v: bigint) => BigInt.asUintN(64, v).toString(16).padStart(16, "0");

function run(c: Case): { label: string; count: string; threw: boolean } {
  // Both table entries exist, and the one the index does NOT select carries different values, so a
  // port that ignored the selector or scaled it wrong reports the wrong count instead of passing.
  const chosen = { base: BigInt("0x" + c.base), at10: BigInt("0x" + c.count) };
  const unchosen = { base: BigInt("0x" + c.other), at10: BigInt("0x" + c.other) };
  const u = new HGExecutionUnit();
  u.state = {
    stackA: c.index === 0 ? chosen : unchosen,
    stackB: c.index === 0 ? unchosen : chosen,
    stackIndex: c.index,
  };
  try {
    u.CommitStack(BigInt("0x" + c.ptr), BigInt("0x" + c.n));
  } catch {
    return { label: c.label, count: hex(chosen.at10), threw: true };
  }
  return { label: c.label, count: hex(chosen.at10), threw: false };
}

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const cases: Case[] = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  process.stdout.write(JSON.stringify(cases.map(run)) + "\n");
});
