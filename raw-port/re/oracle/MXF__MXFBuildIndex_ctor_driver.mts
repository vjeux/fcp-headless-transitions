// MXF__MXFBuildIndex_ctor_driver.mts — the TypeScript side of the differential for
// `MXF::MXFBuildIndex::MXFBuildIndex(MXF::FileReader*, unsigned int, unsigned int)` @Flexo 0x1440250.
//
// Imports the REAL ported module (no build step, no restatement of the port in another language),
// so what is measured is the committed code. The module has no sibling imports, so nothing is
// stubbed — the house stub-the-graph recipe is not needed here, and the driver prints the port
// constructor's own source text so a reviewer can see in one screen that the thing measured is the
// thing committed.
//
// Protocol: reads {"cases": [[fileReaderDec, streamID, indexSID], ...]} on stdin, writes
// {"src": "...", "port": [Result], "mutants": {name: [Result]}} on stdout, where a Result is
//   { image: "<0x80 bytes as hex>", fields: {vtable, streamID, indexSID, fileReader,
//                                            entriesBegin, entriesEnd, entriesEndCap} }
//
// THE IMAGE. The binary is called on a 0x80-byte arena poisoned with 0xCD; the TS side builds the
// same arena by writing the port's fields at the offsets the port DOCUMENTS, and leaving every
// other byte poisoned. So the offsets are part of what is under test: a field written at the wrong
// place, or a store the port forgot, shows up as a byte difference against live Flexo rather than
// being normalised away. (The layout used here is stated in one place, `layout()` below, and it is
// exactly the table in the port's file header.)
//
//   node --experimental-strip-types MXF__MXFBuildIndex_ctor_driver.mts
import { MXF__MXFBuildIndex } from "../../src/channels/MXF__MXFBuildIndex.ts";

const ARENA = 0x80;
const POISON = 0xcd;

type Fields = {
  vtable: bigint; streamID: number; indexSID: number; fileReader: bigint;
  entriesBegin: bigint; entriesEnd: bigint; entriesEndCap: bigint;
};
type Placed = { off: number; width: 4 | 8; value: bigint };

/** The port's documented layout, and the only place this driver states it. */
function layout(f: Fields): Placed[] {
  return [
    { off: 0x00, width: 8, value: f.vtable },
    { off: 0x08, width: 4, value: BigInt(f.streamID >>> 0) },
    { off: 0x0c, width: 4, value: BigInt(f.indexSID >>> 0) },
    { off: 0x10, width: 8, value: f.fileReader },
    { off: 0x18, width: 8, value: f.entriesBegin },
    { off: 0x20, width: 8, value: f.entriesEnd },
    { off: 0x28, width: 8, value: f.entriesEndCap },
  ];
}

function image(placed: Placed[], slide: bigint): string {
  const buf = new Uint8Array(ARENA).fill(POISON);
  const dv = new DataView(buf.buffer);
  for (const p of placed) {
    if (p.off < 0 || p.off + p.width > ARENA) continue;
    // The vtable slot holds an image-relative vmaddr in the port; the live object holds
    // slide + vmaddr. The slide is added HERE, on the TS side, so the comparison stays byte-exact
    // instead of the Python side masking the slot out.
    const v = p.off === 0x00 ? p.value + slide : p.value;
    if (p.width === 8) dv.setBigUint64(p.off, BigInt.asUintN(64, v), true);
    else dv.setUint32(p.off, Number(BigInt.asUintN(32, v)), true);
  }
  return Buffer.from(buf).toString("hex");
}

const raw = await new Promise<string>((res) => {
  let s = "";
  process.stdin.on("data", (d) => (s += d));
  process.stdin.on("end", () => res(s));
});
const req = JSON.parse(raw);
const cases: [string, number, number][] = req.cases;
const slide: bigint = BigInt(req.slide);

const asFields = (o: MXF__MXFBuildIndex): Fields => ({
  vtable: o.vtable, streamID: o.streamID, indexSID: o.indexSID, fileReader: o.fileReader,
  entriesBegin: o.entriesBegin, entriesEnd: o.entriesEnd, entriesEndCap: o.entriesEndCap,
});

const strFields = (f: Fields) => ({
  vtable: f.vtable.toString(), streamID: f.streamID, indexSID: f.indexSID,
  fileReader: f.fileReader.toString(), entriesBegin: f.entriesBegin.toString(),
  entriesEnd: f.entriesEnd.toString(), entriesEndCap: f.entriesEndCap.toString(),
});

// ---- the port itself ---------------------------------------------------------------------------
const port = cases.map(([r, a, b]) => {
  const o = new MXF__MXFBuildIndex(BigInt(r), a, b);
  const f = asFields(o);
  return { image: image(layout(f), slide), fields: strFields(f) };
});

// ---- mutants: each is a plausible misreading of THIS body, evaluated in THIS process -------------
//  swapIntegers  the two `unsigned int` args stored the other way round (+0x08 <-> +0x0c). This is
//                the mistake the SysV argument order invites, since the FIRST declared parameter is
//                the pointer and the integers are %edx/%ecx.
//  readerAt0x18  `movq %rsi,0x10(%rdi)` read as a store into the vector's __begin_ instead.
//  vtableSymbol  the vtable constant taken as the vtable SYMBOL 0x192b708 rather than symbol+0x10 —
//                the exact shape of the landed 0x500-low defect this project already recorded.
//  wideStreamID  `movl %edx,0x8(%rdi)` read as a 64-bit `movq`, which would clobber +0x0c.
//  omitEndCap    the trailing `movq $0x0,0x28(%rdi)` missed (the 16-byte store above it looks like
//                it covers the whole tail). Only the 0xCD poison exposes this.
//  zeroTo0x38    `movups %xmm0,0x18(%rdi)` misread as reaching 0x38, i.e. an object whose tail is
//                zeroed past +0x30.
//  signedInts    the two integers modelled as SIGNED 32-bit (`| 0` instead of `>>> 0`). Note this
//                one is invisible in the IMAGE — the four bytes written are identical either way —
//                and is caught only by the FIELD comparison. That is the honest result: the width
//                claim is about the value the port hands its caller, not about the object bytes.
const mut = (
  f: (r: bigint, a: number, b: number) => { placed: Placed[]; fields: Fields },
) => cases.map(([r, a, b]) => {
  const { placed, fields } = f(BigInt(r), a, b);
  return { image: image(placed, slide), fields: strFields(fields) };
});

const base = (r: bigint, a: number, b: number) =>
  asFields(new MXF__MXFBuildIndex(r, a, b));

const mutants = {
  swapIntegers: mut((r, a, b) => {
    const f = base(r, b, a);
    return { placed: layout(f), fields: f };
  }),
  readerAt0x18: mut((r, a, b) => {
    const f = base(r, a, b);
    const p = layout(f).filter((x) => x.off !== 0x10 && x.off !== 0x18);
    p.push({ off: 0x18, width: 8, value: f.fileReader });
    return { placed: p, fields: f };
  }),
  vtableSymbol: mut((r, a, b) => {
    const f = { ...base(r, a, b), vtable: 0x192b708n };
    return { placed: layout(f), fields: f };
  }),
  wideStreamID: mut((r, a, b) => {
    const f = base(r, a, b);
    const p = layout(f).filter((x) => x.off !== 0x08 && x.off !== 0x0c);
    p.push({ off: 0x08, width: 8, value: BigInt(f.streamID >>> 0) });
    return { placed: p, fields: f };
  }),
  omitEndCap: mut((r, a, b) => {
    const f = base(r, a, b);
    return { placed: layout(f).filter((x) => x.off !== 0x28), fields: f };
  }),
  zeroTo0x38: mut((r, a, b) => {
    const f = base(r, a, b);
    const p = layout(f);
    p.push({ off: 0x30, width: 8, value: 0n });
    return { placed: p, fields: f };
  }),
  signedInts: mut((r, a, b) => {
    const o = base(r, a, b);
    const f = { ...o, streamID: o.streamID | 0, indexSID: o.indexSID | 0 };
    return { placed: layout(f), fields: f };
  }),
};

process.stdout.write(JSON.stringify({
  src: MXF__MXFBuildIndex.prototype.constructor.toString(),
  port,
  mutants,
}));
