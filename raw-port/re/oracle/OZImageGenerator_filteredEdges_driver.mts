// OZImageGenerator_filteredEdges_driver.mts — TS half of the differential for @Ozone 0x30c120.
// Run by OZImageGenerator_filteredEdges_oracle.py through
//   node --experimental-strip-types OZImageGenerator_filteredEdges_driver.mts
// It imports the REAL port and calls the REAL method.
const portHref =
  process.env.OZIMAGEGENERATOR_TS !== undefined
    ? new URL(`file://${process.env.OZIMAGEGENERATOR_TS}`).href
    : new URL("../../src/channels/OZImageGenerator.ts", import.meta.url).href;
const { OZImageGenerator } = (await import(portHref)) as {
  OZImageGenerator: new () => { filteredEdges: () => boolean };
};

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const { calls } = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { calls: number };
  const g = new OZImageGenerator();
  const port: boolean[] = [];
  for (let i = 0; i < calls; i++) port.push(g.filteredEdges());
  // For a one-instruction constant there is exactly one way to be wrong about the VALUE, and one
  // about the family: returning the sibling's answer instead of this class's.
  process.stdout.write(
    JSON.stringify({
      port,
      mutants: [
        { name: "M1 returns true (the OZGradientSource answer)", values: new Array(calls).fill(true) },
      ],
    }),
  );
});
