// PCAtomBoxFile_closeOutputFile_driver.mts — the TS half of the
// closeOutputFile() differential.  Run by
// PCAtomBoxFile_closeOutputFile_oracle.py as
//   node --experimental-strip-types PCAtomBoxFile_closeOutputFile_driver.mts
// reading the case list as JSON on stdin and writing JSON on stdout.
//
// It imports the REAL port (../../src/infra/PCAtomBoxFile.ts) rather than a
// restatement of it, so a misreading of the disassembly cannot be shared
// between the two sides of the comparison.  The three mutants are evaluated in
// THIS SAME process on THE SAME cases, so the control numbers are
// apples-to-apples with the port's.
// The port is imported DYNAMICALLY so the same driver can be pointed at a
// leased pool worktree's copy (PCATOMBOXFILE_TS=<abs path>) while the default
// is the in-repo relative path; the port itself imports nothing, so no resolve
// hook is needed.
const portHref =
  process.env.PCATOMBOXFILE_TS !== undefined
    ? new URL(`file://${process.env.PCATOMBOXFILE_TS}`).href
    : new URL("../../src/infra/PCAtomBoxFile.ts", import.meta.url).href;
const { PCAtomBoxFile } = (await import(portHref)) as {
  PCAtomBoxFile: new () => unknown;
};

type Case = { name: string; file: boolean; buf: boolean };
type Row = {
  case: string;
  fileNulled: boolean;
  bufNulled: boolean;
  threw: boolean;
  strayFields: number; // fields other than outputFile/outputBuffer that changed
};

const FILE_SENTINEL = { kind: "FILE*" };
const BUF_SENTINEL = { kind: "operator new[] buffer" };

// The arena-diff of the Python side has an exact counterpart here: snapshot
// every other own property of the object and confirm the method touched none.
function otherProps(o: Record<string, unknown>): string {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o)) {
    if (k === "outputFile" || k === "outputBuffer") continue;
    out[k] = o[k];
  }
  return JSON.stringify(out);
}

function runPort(c: Case): Row {
  const o = new PCAtomBoxFile() as Record<string, unknown>;
  o.outputFile = c.file ? FILE_SENTINEL : null;
  o.outputBuffer = c.buf ? BUF_SENTINEL : null;
  const before = otherProps(o);
  let threw = false;
  try {
    (o as unknown as { closeOutputFile: () => void }).closeOutputFile();
  } catch {
    threw = true;
  }
  return {
    case: c.name,
    fileNulled: o.outputFile === null,
    bufNulled: o.outputBuffer === null,
    threw,
    strayFields: before === otherProps(o) ? 0 : 1,
  };
}

// ---------------------------------------------------------------------------
// Mutants.  Each is a deliberate misreading of @ProCore 0x24d64; a mutant that
// kills 0 cases is reported as such rather than quietly dropped (OPS_LOG: "a
// dead negative control means your harness is blind or your mutant is
// equivalent — say which").
// ---------------------------------------------------------------------------
type Model = (c: Case) => Row;

// M1 is the EXACT body this PR was rejected for: the two lifetime boundaries
// written as `throw`, which makes both nulling stores unreachable.
const m1_throwingBoundaries: Model = (c) => {
  let file: unknown = c.file ? FILE_SENTINEL : null;
  let buf: unknown = c.buf ? BUF_SENTINEL : null;
  let threw = false;
  try {
    if (file !== null) {
      throw new Error("_fclose @0xde864 (libc extern) not modelled in port scope");
      // unreachable: file = null;
    }
    if (buf !== null) {
      throw new Error("operator delete[] __ZdaPv @0xde6ba not modelled in port scope");
      // unreachable: buf = null;
    }
  } catch {
    threw = true;
  }
  return { case: c.name, fileNulled: file === null, bufNulled: buf === null, threw, strayFields: 0 };
};

// M2: the store at 0x24d91 dropped — the buffer field is left dangling.
const m2_dropsBufferStore: Model = (c) => {
  let file: unknown = c.file ? FILE_SENTINEL : null;
  const buf: unknown = c.buf ? BUF_SENTINEL : null;
  if (file !== null) file = null;
  return { case: c.name, fileNulled: file === null, bufNulled: buf === null, threw: false, strayFields: 0 };
};

// M3: the two `testq`/`je` guards read backwards (release the field that is
// ALREADY null).  This is the polarity error the guards exist to prevent.
const m3_invertedGuards: Model = (c) => {
  let file: unknown = c.file ? FILE_SENTINEL : null;
  let buf: unknown = c.buf ? BUF_SENTINEL : null;
  if (file === null) file = null;
  if (buf === null) buf = null;
  return { case: c.name, fileNulled: file === null, bufNulled: buf === null, threw: false, strayFields: 0 };
};

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const cases: Case[] = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const out = {
    port: cases.map(runPort),
    mutants: [
      { name: "M1 boundaries throw (the rejected body)", results: cases.map(m1_throwingBoundaries) },
      { name: "M2 drops the 0x24d91 store", results: cases.map(m2_dropsBufferStore) },
      { name: "M3 both null-guards inverted", results: cases.map(m3_invertedGuards) },
    ],
  };
  process.stdout.write(JSON.stringify(out));
});
