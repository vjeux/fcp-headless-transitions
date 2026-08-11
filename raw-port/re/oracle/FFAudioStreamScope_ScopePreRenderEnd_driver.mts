// TS half of the differential for FFAudioStreamScope::ScopePreRenderEnd @Flexo 0xe6cc50. The live
// side checks that the machine writes nothing into its receiver; the JS counterpart of "the
// receiver is unchanged" is "no own property of the instance changed", so the driver poisons the
// object with marker properties and diffs them.
const portHref =
  process.env.FFAUDIOSTREAMSCOPE_TS !== undefined
    ? new URL(`file://${process.env.FFAUDIOSTREAMSCOPE_TS}`).href
    : new URL("../../src/infra/FFAudioStreamScope.ts", import.meta.url).href;
const { FFAudioStreamScope } = (await import(portHref)) as {
  FFAudioStreamScope: new () => { ScopePreRenderEnd: () => void };
};

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const { calls } = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { calls: number };
  let threw = false;
  let changed = 0;
  for (let i = 0; i < calls; i++) {
    const o = new FFAudioStreamScope() as unknown as Record<string, unknown>;
    for (let k = 0; k < 8; k++) o[`poison${k}`] = 0xcd;
    const before = JSON.stringify(o);
    try {
      (o as unknown as { ScopePreRenderEnd: () => void }).ScopePreRenderEnd();
    } catch {
      threw = true;
    }
    if (JSON.stringify(o) !== before) changed += 1;
  }
  process.stdout.write(JSON.stringify({ threw, changed }));
});
