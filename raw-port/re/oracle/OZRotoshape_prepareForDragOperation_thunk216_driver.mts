// TS half of the differential for the +216 thunk @Ozone 0x41b850. Imports the REAL port.
const portHref =
  process.env.OZROTOSHAPE_TS !== undefined
    ? new URL(`file://${process.env.OZROTOSHAPE_TS}`).href
    : new URL("../../src/channels/OZRotoshape.ts", import.meta.url).href;
const { OZRotoshape } = (await import(portHref)) as {
  OZRotoshape: new () => {
    prepareForDragOperation_thunk216: (a: unknown, b: unknown, c: number, d: number) => boolean;
  };
};

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const { calls } = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { calls: number };
  const r = new OZRotoshape();
  const port: boolean[] = [];
  for (let i = 0; i < calls; i++) {
    port.push(r.prepareForDragOperation_thunk216(null, null, 0xdeadbeef, 0xfeedface));
  }
  process.stdout.write(
    JSON.stringify({
      port,
      mutants: [
        { name: "M1 returns false", values: new Array(calls).fill(false) },
      ],
    }),
  );
});
