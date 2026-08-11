// TS side of the differential oracle for
// PCXMLStreamElement::getAttributeAsCString(unsigned int) const @ProCore 0x290f6.
//
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/PCXMLStreamElement_getAttributeAsCString_oracle.py, which builds the
// IDENTICAL element arena in real process memory, calls the live ProCore symbol on it, and
// compares the returned pointer with what this port returns.
//
// Pointer values cross the wire as 16-hex-char BIT PATTERNS, never JS numbers: a userspace
// pointer exceeds 2^53 and JSON numbers would round it (same family of hazard as the
// json.dump NaN/Infinity trap in OPS_LOG). The port's own return type is bigint, so the
// comparison is exact.
import {
  PCXMLStreamElement,
  type PCXMLStreamElementAttrMap,
  type PCXMLStreamElementAttrNode,
} from "../../src/infra/PCXMLStreamElement.js";

interface WireNode {
  /** index into the case's node array, or -1 for nullptr */
  l: number;
  r: number;
  key: number;
  /** 16 hex chars */
  val: string;
}

interface WireCase {
  /** value of the +0xb8 count field */
  n: number;
  /** ALL SEVEN inline slots (+0x48..+0xb7); only the first `n` are live */
  slots: { id: number; val: string }[];
  /** null => the +0xc0 map pointer is null */
  map: { root: number; nodes: WireNode[] } | null;
  /** the attribute id passed in %esi */
  q: number;
}

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as WireCase[];
  const out = cases.map((c) => {
    const el = new PCXMLStreamElement();
    el.inlineAttrCount = c.n;
    el.inlineAttrs = c.slots.map((s) => ({ id: s.id, value: BigInt("0x" + s.val) }));

    let map: PCXMLStreamElementAttrMap | null = null;
    if (c.map !== null) {
      const nodes: PCXMLStreamElementAttrNode[] = c.map.nodes.map((w) => ({
        __left_: null,
        __right_: null,
        key: w.key,
        value: BigInt("0x" + w.val),
      }));
      c.map.nodes.forEach((w, i) => {
        const node = nodes[i];
        if (node === undefined) throw new Error("bad wire node index " + i);
        node.__left_ = w.l < 0 ? null : (nodes[w.l] ?? null);
        node.__right_ = w.r < 0 ? null : (nodes[w.r] ?? null);
      });
      map = {
        __end_node___left_: c.map.root < 0 ? null : (nodes[c.map.root] ?? null),
      };
    }
    el.attrMap = map;

    return el.getAttributeAsCString(c.q).toString(16).padStart(16, "0");
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
