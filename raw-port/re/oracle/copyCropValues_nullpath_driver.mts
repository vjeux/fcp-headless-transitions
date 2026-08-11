// copyCropValues_nullpath_driver.mts — the TypeScript side of the null-buffer
// differential. Imports the REAL port through node's native type stripping.
//
//     node --experimental-strip-types copyCropValues_nullpath_driver.mts
//
// The port writes into a Float32Array, so the arena is read back as raw bit patterns
// (never as JS numbers) to keep the comparison exact about signed zero — `xorps`
// produces +0.0 = 0x00000000 specifically, and a value comparison could not tell that
// from -0.0. The mutants run in this same process, apples-to-apples with the port.

// A plain static import: copyCropValues.ts imports nothing, so this driver needs no
// `.js`->`.ts` resolve hook (that hook ships with the HGFreeAlign differential, whose
// port DOES import a sibling — deliberately not duplicated here, so two open PRs do not
// both add the same file).
import { copyCropValues } from "../../src/render/copyCropValues.ts";

const ARENA_FLOATS = 8;
const POISON_BYTE = 0xcd;

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const { shifts } = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { shifts: number[] };

/** A Float32Array over 8 floats of 0xCD bytes — the same poisoned arena the Python side
 *  hands the binary, so "did it touch the tail" is the same question on both sides. */
function poisoned(): { arr: Float32Array; buf: ArrayBuffer } {
  const buf = new ArrayBuffer(ARENA_FLOATS * 4);
  new Uint8Array(buf).fill(POISON_BYTE);
  return { arr: new Float32Array(buf), buf };
}

function bitsOf(buf: ArrayBuffer): number[] {
  const dv = new DataView(buf);
  return [0, 1, 2, 3].map((i) => dv.getUint32(i * 4, true) >>> 0);
}

function tailUntouched(buf: ArrayBuffer): boolean {
  const u8 = new Uint8Array(buf);
  for (let i = 16; i < ARENA_FLOATS * 4; i++) if (u8[i] !== POISON_BYTE) return false;
  return true;
}

const port: number[][] = [];
const mutants = {
  m1_wide: [] as { bits: number[]; tail_untouched: boolean }[],
  m2_nostore: [] as { bits: number[]; tail_untouched: boolean }[],
  m3_ones: [] as { bits: number[]; tail_untouched: boolean }[],
  m4_negzero: [] as { bits: number[]; tail_untouched: boolean }[],
};

for (const shift of shifts) {
  // --- the port under test ---------------------------------------------------
  const p = poisoned();
  copyCropValues(null, shift, p.arr);
  port.push(bitsOf(p.buf));

  // --- negative controls -----------------------------------------------------
  // M1: the `movups %xmm0,(%rbx)` store read as 32 bytes instead of 16.
  const m1 = poisoned();
  for (let i = 0; i < 8; i++) m1.arr[i] = 0;
  mutants.m1_wide.push({ bits: bitsOf(m1.buf), tail_untouched: tailUntouched(m1.buf) });

  // M2: the null early exit read as "return without storing".
  const m2 = poisoned();
  mutants.m2_nostore.push({ bits: bitsOf(m2.buf), tail_untouched: tailUntouched(m2.buf) });

  // M3: the zeroing read as a unit fill.
  const m3 = poisoned();
  for (let i = 0; i < 4; i++) m3.arr[i] = 1;
  mutants.m3_ones.push({ bits: bitsOf(m3.buf), tail_untouched: tailUntouched(m3.buf) });

  // M4: `xorps %xmm0,%xmm0` misread as a sign flip, i.e. -0.0 rather than +0.0. This is
  // the mutant a value-equality comparison could NOT kill, which is why the harness
  // exchanges bit patterns.
  const m4 = poisoned();
  for (let i = 0; i < 4; i++) m4.arr[i] = -0;
  mutants.m4_negzero.push({ bits: bitsOf(m4.buf), tail_untouched: tailUntouched(m4.buf) });
}

process.stdout.write(JSON.stringify({ port, mutants }));
