// OZChanObjectRef_Factory_getIconIDInternal_driver.mts — TS half of the differential for
// @ProChannel 0x13054. Run by OZChanObjectRef_Factory_getIconIDInternal_oracle.py as
//   node --experimental-strip-types OZChanObjectRef_Factory_getIconIDInternal_driver.mts
//
// Imports the REAL port and calls the REAL static, rather than restating it — the point of the
// exercise is to measure the file that would land.
const portHref =
  process.env.OZCHANOBJECTREF_FACTORY_TS !== undefined
    ? new URL(`file://${process.env.OZCHANOBJECTREF_FACTORY_TS}`).href
    : new URL("../../src/channels/OZChanObjectRef_Factory.ts", import.meta.url).href;
const { OZChanObjectRef_Factory } = (await import(portHref)) as {
  OZChanObjectRef_Factory: { getIconIDInternal: () => number };
};

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const { calls } = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { calls: number };
  const port: number[] = [];
  for (let i = 0; i < calls; i++) port.push(OZChanObjectRef_Factory.getIconIDInternal());

  // Mutants. For a five-instruction constant there are exactly three ways to be wrong, and all
  // three are things a transcriber actually does: read the immediate as UNSIGNED, read a 32-bit
  // move as a 64-bit one, or take "no icon" to mean zero.
  const m1: number[] = new Array(calls).fill(0xffffffff);        // unsigned reading of the imm
  const m2: number[] = new Array(calls).fill(0);                 // "no icon" as 0
  const m3: number[] = new Array(calls).fill(-2);                // off-by-one sentinel
  process.stdout.write(
    JSON.stringify({
      port,
      mutants: [
        { name: "M1 imm read as UNSIGNED 0xffffffff", values: m1 },
        { name: "M2 'no icon' modelled as 0", values: m2 },
        { name: "M3 sentinel off by one (-2)", values: m3 },
      ],
    }),
  );
});
