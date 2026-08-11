// OZFootageLayer_getDescendantAtIndex_driver.mts — replay the probe's cases through the REAL port.
//
// Run by raw-port/re/oracle/OZFootageLayer_getDescendantAtIndex_probe.py as
//     node --experimental-strip-types <this file>
// with the case list on stdin as JSON and the answers on stdout as JSON.
//
// This imports raw-port/src/nodes/OZFootageLayer.ts DIRECTLY (node 24 strips types natively, no
// build step), so what is compared against live Final Cut Pro is the shipped TypeScript, not a
// restatement of it in the harness language — the failure mode where the oracle and the port share
// the same misreading of the disassembly. The port's only import is `import type`, which is erased,
// so no resolve hook is needed here.
import { OZFootageLayer } from "../../src/nodes/OZFootageLayer.ts";
import type {
  OZFootageLayerDescendantLink,
  OZFootageLayerDescendantPayload,
} from "../../src/nodes/OZFootageLayer.ts";

type Kind = "NULL" | "FILE" | "SCENE" | "OPAQUE";
interface Case { case: string; index: number; kinds: Kind[] }

// A stand-in for the OZSceneNode the payload points at. The port never reads anything out of it —
// the machine only ever forms `payload + 0x10` from the pointer — so identity is all that is
// needed, and identity is exactly what the comparison uses.
type SceneNode = OZFootageLayerDescendantPayload["node"];
function sceneNode(i: number): SceneNode {
  return { __payloadIndex: i } as unknown as SceneNode;
}

function payload(kind: Kind, i: number): OZFootageLayerDescendantPayload | null {
  if (kind === "NULL") return null;
  // FILE  -> ___dynamic_cast @0x150c05 returns non-null (the payload IS an OZSceneNodeFile).
  // SCENE -> the cast returns null. OPAQUE is a non-null payload on the index-0 path, where the
  //          machine never performs the cast at all; modelled as a cast that would fail.
  return { node: sceneNode(i), isOZSceneNodeFile: kind === "FILE" };
}

function run(c: Case): string {
  const layer = new OZFootageLayer();
  const sentinel = layer.descendants_at_0x438;
  const payloads = c.kinds.map((k, i) => payload(k, i));
  const nodes: OZFootageLayerDescendantLink[] = payloads.map((p) => ({
    link_at_0x08: sentinel,
    payload_at_0x10: p,
  }));
  for (let i = 0; i < nodes.length; i++) {
    nodes[i]!.link_at_0x08 = i + 1 < nodes.length ? nodes[i + 1]! : sentinel;
  }
  sentinel.link_at_0x08 = nodes.length ? nodes[0]! : sentinel;

  const got = layer.getDescendantAtIndex(c.index);
  if (got === null) return "NULL";
  if (got.byteOffset !== 0x10) return `UNEXPECTED byteOffset ${got.byteOffset}`;
  const idx = payloads.findIndex((p) => p !== null && p.node === got.owner);
  return idx < 0 ? "UNKNOWN owner" : `payload[${idx}]+0x10`;
}

const stdin = await new Promise<string>((resolve) => {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (buf += d));
  process.stdin.on("end", () => resolve(buf));
});
const cases: Case[] = JSON.parse(stdin);

// ---------------------------------------------------------------------------------------------
// NEGATIVE CONTROLS. "12 of 12 agree" is only worth what the corpus can kill, so three plausible
// WRONG readings of the disassembly are evaluated over the same cases, in this same process:
//   M1 off-by-one     — stop ON the element that incremented the count (test count == index
//                       BEFORE `movq 0x8(%r13),%r13` @0x150c12 rather than after it).
//   M2 filter-index-0 — treat index 0 like any other index, i.e. miss the `orb %cl,%dl` /
//                       `jne 0x150c23` @0x150bdd short-circuit that skips the walk entirely.
//   M3 count-nulls    — drop the `testq %rdi,%rdi` / `je 0x150c12` @0x150bf4 null-payload skip.
// Each is the whole algorithm with exactly one clause changed; none of them may agree with the
// live binary on every case, and the probe prints how many cases each one loses.
// ---------------------------------------------------------------------------------------------
type Mutant = "M1" | "M2" | "M3";

function runMutant(c: Case, m: Mutant): string {
  const payloads = c.kinds.map((k, i) => payload(k, i));
  const n = payloads.length;
  const want = c.index >>> 0;
  let cursor = n ? 0 : -1; // -1 == the sentinel
  let notSentinel = cursor !== -1;
  if (notSentinel && (want !== 0 || m === "M2")) {
    let count = 0;
    for (;;) {
      const p = payloads[cursor]!;
      if (p !== null || m === "M3") {
        if (p === null || p.isOZSceneNodeFile) count = (count + 1) >>> 0;
      }
      if (m === "M1" && count === want) break;
      cursor = cursor + 1 < n ? cursor + 1 : -1;
      notSentinel = cursor !== -1;
      if (!notSentinel) break;
      if (m !== "M1" && count === want) break;
    }
  }
  if (!notSentinel) return "NULL";
  const p = payloads[cursor]!;
  return p === null ? "NULL" : `payload[${cursor}]+0x10`;
}

const answers = cases.map((c) => ({
  case: c.case,
  answer: run(c),
  mutants: { M1: runMutant(c, "M1"), M2: runMutant(c, "M2"), M3: runMutant(c, "M3") },
}));
process.stdout.write(JSON.stringify(answers));
