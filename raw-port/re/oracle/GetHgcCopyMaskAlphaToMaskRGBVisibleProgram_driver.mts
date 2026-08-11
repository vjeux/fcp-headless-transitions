// TS half of the differential for @Ozone 0x6ab530. It EXECUTES the port and prints the returned
// string as hex, so the comparison is against what the module produces at runtime rather than
// against a re-parse of its source text (which cannot see an escape the runtime resolves
// differently). The string is pure ASCII, so latin1 is a byte-exact encoding of it.
const portHref =
  process.env.GETHGCCOPYMASK_TS !== undefined
    ? new URL(`file://${process.env.GETHGCCOPYMASK_TS}`).href
    : new URL("../../src/render/GetHgcCopyMaskAlphaToMaskRGBVisibleProgram.ts", import.meta.url).href;
const { GetHgcCopyMaskAlphaToMaskRGBVisibleProgram } = (await import(portHref)) as {
  GetHgcCopyMaskAlphaToMaskRGBVisibleProgram: () => string;
};
const s = GetHgcCopyMaskAlphaToMaskRGBVisibleProgram();
process.stdout.write(JSON.stringify({ hex: Buffer.from(s, "latin1").toString("hex") }));
