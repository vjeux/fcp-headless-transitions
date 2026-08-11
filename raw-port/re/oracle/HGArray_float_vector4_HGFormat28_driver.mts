// HGArray<float vector[4],(HGFormat)28>::~HGArray @Helium 0xdc0f0 — TS side of
// the differential. Imports the REAL port (no restatement of it), and reports
// what the two deallocation boundaries did, per case.
//
// The `private static` deallocation boundaries are TypeScript-private only —
// at runtime they are ordinary static properties, so the driver can replace
// them with recorders. That is what makes the free ORDER observable on this
// side without touching the port.
//
//   node --experimental-strip-types HGArray_float_vector4_HGFormat28_driver.mts
import { HGArray_float_vector4_HGFormat28 as HGArray } from
  "../../src/render/HGArray_float_vector4_HGFormat28.ts";

type Case = { name: string; dataRef: null | { refCount: number; buffer: object | null } };

const cases: Case[] = [
  { name: "null-dataRef", dataRef: null },
  { name: "rc3-shared", dataRef: { refCount: 3, buffer: {} } },
  { name: "rc2-shared", dataRef: { refCount: 2, buffer: {} } },
  { name: "rc1-last-with-buffer", dataRef: { refCount: 1, buffer: {} } },
  { name: "rc1-last-null-buffer", dataRef: { refCount: 1, buffer: null } },
];

// MODEL "shipped" = the file as it stands; MODEL "throwing" = the pre-fix model
// review blocked, reproduced here as a negative control rather than described.
const models = ["shipped", "throwing"] as const;
const out: Record<string, unknown>[] = [];

for (const model of models) {
  for (const c of cases) {
    const log: string[] = [];
    const K = HGArray as unknown as Record<string, unknown>;
    const origArr = K.__operatorDeleteArray;
    const origOne = K.__operatorDelete;
    K.__operatorDeleteArray = (_b: unknown) => {
      log.push("delete[]");
      if (model === "throwing") throw new Error("operator delete[] not modelled in port scope");
    };
    K.__operatorDelete = (_b: unknown) => {
      log.push("delete");
      if (model === "throwing") throw new Error("operator delete not modelled in port scope");
    };

    const a = new HGArray();
    // structuredClone keeps each model's run independent
    a.dataRef = c.dataRef === null ? null : { refCount: c.dataRef.refCount, buffer: c.dataRef.buffer };
    let threw: string | null = null;
    try {
      a.destroy();
    } catch (e) {
      threw = (e as Error).message.slice(0, 40);
    }
    out.push({
      model,
      case: c.name,
      refCountAfter: a.dataRef === null ? null : a.dataRef.refCount,
      frees: log,
      threw,
    });
    K.__operatorDeleteArray = origArr;
    K.__operatorDelete = origOne;
  }
}
process.stdout.write(JSON.stringify(out));
