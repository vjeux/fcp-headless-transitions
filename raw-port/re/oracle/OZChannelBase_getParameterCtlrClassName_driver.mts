// OZChannelBase_getParameterCtlrClassName_driver.mts — runs the SHIPPED port, not a restatement.
//
// WHY. The probe beside this file measures the live ProChannel getter and proves it reads +0x58 and
// not its two ten-byte-identical siblings. That is only half of the question a reviewer has to
// answer, because the port is `return this.parameterCtlrClassNameAt58;` — a WRONG-SLOT
// transcription (reading the +0x50 field) is the one defect this body can have, it compiles, cites
// the right address, returns a plausible CFStringRef, and no static gate can see it. So the probe
// also executes the real module and asks it the same question with the same values.
//
//   raw-port/node_modules/.bin/tsx OZChannelBase_getParameterCtlrClassName_driver.mts
//
// tsx rather than `node --experimental-strip-types`: this module's graph imports siblings without a
// file extension and, deeper in, imports a type without the `type` keyword, neither of which plain
// type stripping resolves. Measured on the OZChannel driver landed today; not a defect of this port.
const M = await import("../../src/channels/OZChannelBase.ts");

type Wire = { label: string; parameter: string; inspector: string };

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const cases: Wire[] = JSON.parse(Buffer.concat(chunks).toString("utf8"));

// The three slots the family reads, on an object of the REAL class (prototype and all), so the
// method under test is reached exactly as a caller would reach it.
const results = cases.map((c) => {
  const self = Object.create(M.OZChannelBase.prototype) as InstanceType<typeof M.OZChannelBase>;
  (self as unknown as Record<string, unknown>).labelCtlrClassNameAt50 = c.label;
  (self as unknown as Record<string, unknown>).parameterCtlrClassNameAt58 = c.parameter;
  (self as unknown as Record<string, unknown>).inspectorCtlrClassNameAt60 = c.inspector;
  const got = self.getParameterCtlrClassName() as unknown as string | null;
  return { got: got === null || got === undefined ? null : String(got) };
});

process.stdout.write(JSON.stringify(results));
