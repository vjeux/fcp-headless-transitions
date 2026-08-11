// TS half of the differential for @Ozone 0x6d5550. It EXECUTES the port and prints the returned
// string as hex, so the comparison is against what the module produces at runtime rather than
// against a re-parse of its source text (which cannot see an escape the runtime resolves
// differently). The string is pure ASCII, so latin1 is a byte-exact encoding of it.
//
// The module path is overridable so the oracle can point this at a MUTATED copy of the port and
// require the differential to fail — a control that mutates the port measures the comparison,
// while flipping a byte of the expectation only restates it.
const portHref =
  process.env.GETHGCMASKCOMPADD_TS !== undefined
    ? new URL(`file://${process.env.GETHGCMASKCOMPADD_TS}`).href
    : new URL("../../src/render/GetHgcMaskCompAddVisibleProgram.ts", import.meta.url).href;
const { GetHgcMaskCompAddVisibleProgram } = (await import(portHref)) as {
  GetHgcMaskCompAddVisibleProgram: () => string;
};
const s = GetHgcMaskCompAddVisibleProgram();
process.stdout.write(JSON.stringify({ hex: Buffer.from(s, "latin1").toString("hex") }));
