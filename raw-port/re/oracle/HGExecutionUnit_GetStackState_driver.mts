// TS half of the differential for HGExecutionUnit::GetStackState @Helium 0x1444c0.
const portHref =
  process.env.HGEXECUTIONUNIT_TS !== undefined
    ? new URL(`file://${process.env.HGEXECUTIONUNIT_TS}`).href
    : new URL("../../src/render/HGExecutionUnit.ts", import.meta.url).href;
const { HGExecutionUnit } = (await import(portHref)) as { HGExecutionUnit: new () => any };

type Case = { aAt10: string; bAt10: string; index: number };
type Row = { stackA: boolean; stackB: boolean; aAt10: string; bAt10: string; index: number };
const hex = (v: bigint) => (v & 0xffffffffffffffffn).toString(16).padStart(16, "0");

function run(c: Case, defect: "none" | "swapped" | "sameSlot" | "indexFromA"): Row {
  const A = { at10: BigInt("0x" + c.aAt10) };
  const B = { at10: BigInt("0x" + c.bAt10) };
  const u = new HGExecutionUnit();
  u.state = { stackA: A, stackB: B, stackIndex: c.index };
  if (defect === "none") {
    const r = u.GetStackState();
    return {
      stackA: r.stackA === A, stackB: r.stackB === B,
      aAt10: hex(r.stackAAt10), bAt10: hex(r.stackBAt10), index: r.index ?? r.stackIndex,
    };
  }
  // Deliberate misreadings, written out rather than derived from the port.
  if (defect === "swapped") {
    return { stackA: false, stackB: false, aAt10: hex(B.at10), bAt10: hex(A.at10), index: c.index | 0 };
  }
  if (defect === "sameSlot") {
    // reads +0x10 from stackA twice (the copy-paste error this shape invites)
    return { stackA: true, stackB: true, aAt10: hex(A.at10), bAt10: hex(A.at10), index: c.index | 0 };
  }
  // index taken as 64-bit instead of the 32-bit movl
  return { stackA: true, stackB: true, aAt10: hex(A.at10), bAt10: hex(B.at10), index: c.index };
}

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const cases: Case[] = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  process.stdout.write(
    JSON.stringify({
      port: cases.map((c) => run(c, "none")),
      mutants: [
        { name: "M1 the two stack slots swapped", rows: cases.map((c) => run(c, "swapped")) },
        { name: "M2 both +0x10 reads from the SAME slot", rows: cases.map((c) => run(c, "sameSlot")) },
      ],
    }),
  );
});
