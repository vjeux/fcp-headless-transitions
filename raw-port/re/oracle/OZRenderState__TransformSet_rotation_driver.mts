// TS half of the differential for OZRenderState::TransformSet::rotation(bool) @Ozone 0x277180.
//
// Not part of the port (tsconfig includes src/** only). Driven by
// raw-port/re/oracle/OZRenderState__TransformSet_rotation_oracle.py, which calls the live symbol on
// a poisoned arena and matches the word this driver reports against the bytes left at +0x00.
//
// The three wrong models are written out here rather than derived from the port, and they are the
// three readings this body actually invites: the symmetric `& ~mask` one that ignores the 32-bit
// truncation, one that never takes the AND path, and one that tests the argument a byte wide.
// Bit patterns cross as hex strings — a u64 does not survive JSON's double.
const portHref =
  process.env.OZRENDERSTATE_TRANSFORMSET_TS !== undefined
    ? new URL(`file://${process.env.OZRENDERSTATE_TRANSFORMSET_TS}`).href
    : new URL("../../src/channels/OZRenderState__TransformSet.ts", import.meta.url).href;
const { TransformSet_rotation } = (await import(portHref)) as {
  TransformSet_rotation: (self: { bits: bigint }, enable: number) => void;
};

type Case = { bits: string; arg: string; live: string };
const hex = (v: bigint) => BigInt.asUintN(64, v).toString(16).padStart(16, "0");
const MASK = 0x3fc7n;
const BITS = 0x38n;

function run(c: Case): Record<string, string> {
  const bits = BigInt("0x" + c.bits);
  const arg = BigInt("0x" + c.arg);
  const lo32 = Number(BigInt.asUintN(32, arg)) >>> 0; // what %esi holds
  const on = lo32 !== 0;

  const self = { bits };
  TransformSet_rotation(self, lo32);

  return {
    port: hex(self.bits),
    // the symmetric model: clears the group but keeps everything else, including bits >= 0x4000
    complement_mask: hex(on ? bits | BITS : bits & ~BITS),
    // never takes the cmove: always the OR
    or_on_both: hex(bits | BITS),
    // tests only the low byte of the argument (`testb %sil,%sil` instead of `testl %esi,%esi`)
    byte_test: hex(
      (Number(BigInt.asUintN(8, arg)) & 0xff) !== 0
        ? bits | BITS
        : BigInt.asUintN(32, bits) & MASK,
    ),
    // ANDs in 64 bits — i.e. misses that `movl %eax,%ecx` truncates before the AND
    no_truncate: hex(on ? bits | BITS : bits & MASK),
  };
}

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const cases: Case[] = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  process.stdout.write(JSON.stringify(cases.map(run)) + "\n");
});
