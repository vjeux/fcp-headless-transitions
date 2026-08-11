// TS half of the differential for HGGLContextPtr::HGGLContextPtr(void*) [C2] @Helium 0x1b3920.
//
// Not part of the port (tsconfig includes src/** only). Driven by
// raw-port/re/oracle/HGGLContextPtr_ctor_C2_oracle.py, which calls the live symbol on a poisoned
// arena and matches the word this driver reports against the bytes the call left at +0x00.
//
// Alongside the shipped port it runs three WRONG models, written out here rather than derived from
// the port, so the run reports what each of them costs. A three-instruction body deserves this more
// than a complicated one does: with so little to get wrong, a harness that cannot fail is the most
// likely outcome, and the control counts are the only thing that says otherwise.
//
// Pointers cross as hex strings — a u64 does not survive JSON's double.
const portHref =
  process.env.HGGLCONTEXTPTR_TS !== undefined
    ? new URL(`file://${process.env.HGGLCONTEXTPTR_TS}`).href
    : new URL("../../src/render/HGGLContextPtr.ts", import.meta.url).href;
const { HGGLContextPtr_ctor_C2 } = (await import(portHref)) as {
  HGGLContextPtr_ctor_C2: (self: { ctx_at0x00: unknown }, ctx: unknown) => void;
};

type Case = { ptr: string; live: string };
const hex = (v: bigint) => BigInt.asUintN(64, v).toString(16).padStart(16, "0");
const POISON = 0xeeeeeeeeeeeeeeeen; // what the arena holds before the call

function run(c: Case): Record<string, string> {
  const ctx = BigInt("0x" + c.ptr);

  const self = { ctx_at0x00: POISON as unknown };
  HGGLContextPtr_ctor_C2(self, ctx);

  return {
    port: hex(self.ctx_at0x00 as bigint),
    // the destructor's body (`movq $0x0, (%rdi)`), which is the copy-paste this class invites
    stores_zero: hex(0n),
    // a constructor that forgets the store: the slot keeps whatever was there
    leaves_alone: hex(POISON),
    // %rdi and %rsi transposed — the AT&T operand-order mistake, in its constructor form
    stores_addr_of_self: hex(0x7f0000000000n),
  };
}

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const cases: Case[] = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  process.stdout.write(JSON.stringify(cases.map(run)) + "\n");
});
