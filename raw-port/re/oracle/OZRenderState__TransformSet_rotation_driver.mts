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
const port = (await import(portHref)) as Record<
  string,
  (self: { bits: bigint }, enable: number) => void
>;

// mask/bits per method, from the file's own constants — the OFF mask is 0x3FFF with that method's
// group removed, and the ON immediate is the group.
const MASKS: Record<string, { mask: bigint; bits: bigint; fn: string }> = {
  rotation: { mask: 0x3fc7n, bits: 0x38n, fn: "TransformSet_rotation" },
  translation: { mask: 0x7ffn, bits: 0x3800n, fn: "TransformSet_translation" },
};

type Case = { method: string; bits: string; arg: string; live: string };
const hex = (v: bigint) => BigInt.asUintN(64, v).toString(16).padStart(16, "0");
function run(c: Case): Record<string, string> {
  const { mask: MASK, bits: BITS, fn } = MASKS[c.method]!;
  const bits = BigInt("0x" + c.bits);
  const arg = BigInt("0x" + c.arg);
  // Hand the port the RAW value and let IT truncate. The driver used to pass
  // `Number(BigInt.asUintN(32, arg)) >>> 0`, which applies the very operation the port is being
  // tested for, so the 32-vs-64 case the corpus advertises (`arg = 0x1_0000_0000`, whose low 32
  // bits are zero and which the machine must therefore treat as FALSE) measured the driver's
  // asUintN and not the port's `>>> 0`. Measured after reviewer 4 pointed at it: with the old
  // driver, mutating both bodies to `enable !== 0` still scored 288/288 VERIFIED — the control was
  // dead and the count looked healthy. An instrument must not perform the operation under test on
  // its subject's input.
  const on = Number(BigInt.asUintN(32, arg)) >>> 0 !== 0;   // what %esi holds, for the MODELS only

  const self = { bits };
  port[fn]!(self, Number(BigInt.asUintN(53, arg)));

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
