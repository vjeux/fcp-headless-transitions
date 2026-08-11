// TS half of the differential for PCAtomBoxFile::getWritePercentDone @ProCore 0x25e94. Imports the
// REAL port; doubles cross the wire as hex bit patterns in both directions.
const portHref =
  process.env.PCATOMBOXFILE_TS !== undefined
    ? new URL(`file://${process.env.PCATOMBOXFILE_TS}`).href
    : new URL("../../src/infra/PCAtomBoxFile.ts", import.meta.url).href;
const { PCAtomBoxFile } = (await import(portHref)) as {
  PCAtomBoxFile: new () => {
    totalBytes_at_0x68: bigint;
    writtenBytes_at_0x80: bigint;
    getWritePercentDone: () => number;
  };
};

const dv = new DataView(new ArrayBuffer(8));
const toBits = (v: number) => { dv.setFloat64(0, v); return dv.getBigUint64(0).toString(16).padStart(16, "0"); };

type Case = { w: string; t: string };

function port(c: Case): string {
  const o = new PCAtomBoxFile();
  o.writtenBytes_at_0x80 = BigInt("0x" + c.w);
  o.totalBytes_at_0x68 = BigInt("0x" + c.t);
  return toBits(o.getWritePercentDone());
}

// Mutants. The first two are the whole point of the corpus: getting either conversion's SIGNEDNESS
// wrong is invisible until bit 63 is set.
const S = (h: string) => Number(BigInt.asIntN(64, BigInt("0x" + h)));
const U = (h: string) => {
  const u = BigInt.asUintN(64, BigInt("0x" + h));
  return Number(u >> 32n) * 4294967296 + Number(u & 0xffffffffn);
};
const m1 = (c: Case) => toBits((S(c.w) * 100) / S(c.t));            // denominator read SIGNED
const m2 = (c: Case) => toBits((U(c.w) * 100) / U(c.t));            // numerator read UNSIGNED
const m3 = (c: Case) => toBits(S(c.w) / U(c.t) * 100);              // scale applied after the divide
const m4 = (c: Case) => toBits((S(c.w) * 100) / Number(BigInt.asUintN(64, BigInt("0x" + c.t))));
                                                                     // Number() on the bigint instead
                                                                     // of the lane sequence

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const cases: Case[] = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  process.stdout.write(
    JSON.stringify({
      port: cases.map(port),
      mutants: [
        { name: "M1 denominator converted SIGNED", values: cases.map(m1) },
        { name: "M2 numerator converted UNSIGNED", values: cases.map(m2) },
        { name: "M3 x100 applied after the divide", values: cases.map(m3) },
        { name: "M4 Number(bigint) instead of the lane sequence", values: cases.map(m4) },
      ],
    }),
  );
});
