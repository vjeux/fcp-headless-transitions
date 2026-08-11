// TS side of the differential oracle for OZSplineNode::compare @ProChannel 0x2a26e.
//
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/OZSplineNode_compare_oracle.py, which builds the SAME objects in real process
// memory — with real vtable pointers, so `___dynamic_cast` decides for real — calls the live
// ProChannel function on them, and compares the returned int.
//
// THIS DRIVER IMPORTS THE SHIPPED FILE (or, for a mutation control, a textual mutant OF the shipped
// file whose path arrives in FCT_PORT_PATH). It does not restate the port: a harness that compares
// FCP against a re-implementation cannot detect a defect in the file being shipped, at any corpus
// size.
//
// The four doubles cross the wire as raw bit patterns (16 hex chars), never as JSON numbers:
// Python's json.dump emits bare NaN/Infinity which JSON.parse rejects, and bit patterns keep -0.0
// and NaN exact — which matters here, because IEEE equality on -0.0/+0.0 and on NaN is precisely
// what the compared branches test.

interface WireCase {
  name: string;
  /** f64 bit patterns, 16 hex chars */
  thisValue: string;
  thisDefault: string;
  otherValue: string;
  otherDefault: string;
  thisSpline: boolean;
  otherSpline: boolean;
  /** "null" | "spline" | "const" */
  otherKind: string;
}

const scratch = new DataView(new ArrayBuffer(8));
function f64(hex: string): number {
  scratch.setBigUint64(0, BigInt("0x" + hex), true);
  return scratch.getFloat64(0, true);
}

const portPath = process.env.FCT_PORT_PATH ?? "../../src/nodes/OZSplineNode.js";

async function main(): Promise<void> {
  const mod = (await import(portPath)) as { OZSplineNode: { prototype: object } };
  const OZSplineNode = mod.OZSplineNode;

  // THE BASE PROTOTYPE IS TAKEN FROM THE PORT ITSELF, not imported separately.
  //
  // This is not a shortcut, it is the fix for a real defect this harness had: a mutant copy of the
  // port (which must import its siblings by absolute path, since it lives outside src/) and a
  // driver importing `../../src/nodes/OZConstantNode.js` end up with TWO DISTINCT module instances
  // of OZConstantNode, so `other instanceof OZConstantNode` inside the port is false for an object
  // the driver built from the other instance's prototype. That made every mutant run answer 0 for
  // the wrong reason, and showed up as a DEAD MUTANT — a control that was measuring module
  // identity rather than the port. Reading the base off `OZSplineNode.prototype`'s own prototype
  // chain binds to whichever instance the port under test actually uses, in both modes.
  const splineProto = OZSplineNode.prototype;
  const constProto = Object.getPrototypeOf(splineProto) as object;

  const chunks: Buffer[] = [];
  process.stdin.on("data", (c: Buffer) => chunks.push(c));
  process.stdin.on("end", () => {
    const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as WireCase[];
    // `new OZSplineNode(...)` is not usable yet: the inherited OZConstantNode copy-ctor's own base
    // call is still a frontier throw-stub. Object.create gives the prototype chain, which is what
    // `instanceof` — i.e. the modelled dynamic_cast — actually reads. Building the object this way
    // mirrors what the machine side does: allocate the storage, install the vtable pointer, then
    // set the fields.
    const mk = (proto: object, v: number, d: number, spline: boolean): Record<string, unknown> => {
      const o = Object.create(proto) as Record<string, unknown>;
      o["value"] = v;
      o["defaultValue"] = d;
      // A stand-in for the OZSpline: on every path this harness covers the port only tests this
      // field for null-ness, exactly as the machine only tests the pointer (`testq`/`sete`
      // @0x2a2b9..@0x2a2c6). The native side hands the same paths a plain 0xb0-byte buffer.
      o["spline"] = spline ? {} : null;
      return o;
    };
    const out = cases.map((c) => {
      const self = mk(splineProto, f64(c.thisValue), f64(c.thisDefault), c.thisSpline);
      let other: unknown = null;
      if (c.otherKind === "spline") {
        other = mk(splineProto, f64(c.otherValue), f64(c.otherDefault), c.otherSpline);
      } else if (c.otherKind === "const") {
        other = mk(constProto, f64(c.otherValue), f64(c.otherDefault), c.otherSpline);
      }
      return (self as { compare: (o: unknown) => number }).compare(other);
    });
    process.stdout.write(JSON.stringify(out) + "\n");
  });
}

void main();
