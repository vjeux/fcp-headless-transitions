// HGPool::registerPool / unregisterPool — TS side of the live differential.
// Imports the REAL port (no restatement) and replays the same sequence the
// Python harness drives through the live Helium functions, reporting the
// registry's shape after every step: size, capacity, and the order of the
// surviving elements as INDICES into the pool list (the two sides cannot share
// addresses, so indices are the comparable form).
//
// It also prices three MUTANTS of the port's own decisions, each run in this
// same process on the same sequence, so a control that kills nothing is
// visible as a blind spot rather than read as agreement.
//
//   node --experimental-strip-types HGPool_registry_driver.mts
import {
  HGPool_registerPool,
  HGPool_unregisterPool,
  _GLOBAL__N_1_registry,
} from "../../src/render/HGPool.ts";
import type { HGPool_BasePool, HGPool_Registry } from "../../src/render/HGPool.ts";

type Step = { op: string; size: number; capacity: number; order: number[] };

const POOLS = 6;
const mkPools = () =>
  Array.from({ length: POOLS }, (_, i) => ({ __id: i }) as unknown as HGPool_BasePool);

function order(reg: HGPool_Registry, pools: HGPool_BasePool[]): number[] {
  return reg.pools.map((p) => {
    const i = pools.indexOf(p);
    return i < 0 ? -1 : i;
  });
}

/** The exact sequence the Python side drives through the live binary. */
function drive(
  register: (p: HGPool_BasePool) => void,
  unregister: (p: HGPool_BasePool) => void,
): Step[] {
  // Do NOT preset the registry: the port's own call_once installs it on the
  // first register, which is the path the machine takes too. And re-read the
  // box after every call rather than capturing it once — the initializer
  // REPLACES the object, so a captured reference would report the discarded
  // one (it did, on the first run of this harness: 0/12 with every live step
  // correct. The harness was wrong, not the port).
  const pools = mkPools();
  const out: Step[] = [];
  const reg = () => _GLOBAL__N_1_registry.value!;
  // 6 distinct pools then #2 again: a duplicate registration is what makes
  // "erase only the FIRST match" (@0x8ca13) measurable.
  for (const p of [...pools, pools[2]!]) {
    register(p);
    out.push({ op: "register", size: reg().pools.length, capacity: reg().capacity,
               order: order(reg(), pools) });
  }
  const absent = { __id: 99 } as unknown as HGPool_BasePool;
  for (const [label, victim] of [
    ["erase-dup", pools[2]!],
    ["erase-middle", pools[1]!],
    ["erase-last", pools[POOLS - 1]!],
    ["erase-absent", absent],
    ["erase-first", pools[0]!],
  ] as const) {
    unregister(victim);
    out.push({ op: label, size: reg().pools.length, capacity: reg().capacity,
               order: order(reg(), pools) });
  }
  return out;
}

const shipped = drive(HGPool_registerPool, HGPool_unregisterPool);

// ---------------------------------------------------------------- mutants
// Each mutant keeps the port's structure and changes exactly one decision that
// the live sequence can see. They are re-implementations ONLY of the decision
// under test, driven through the same harness.
function mutantDriver(kind: "no-double" | "grow-always" | "erase-all"): Step[] {
  const reg: HGPool_Registry = { pools: [], capacity: 0 };
  _GLOBAL__N_1_registry.value = reg;
  const pools = mkPools();
  const out: Step[] = [];
  const push = (p: HGPool_BasePool) => {
    const size = reg.pools.length;
    if (kind === "grow-always" || size >= reg.capacity) {
      // "no-double": capacity grows to exactly size+1 instead of max(2*cap, size+1)
      reg.capacity = kind === "no-double" ? size + 1 : Math.max(2 * reg.capacity, size + 1);
    }
    reg.pools[size] = p;
  };
  const erase = (p: HGPool_BasePool) => {
    if (kind === "erase-all") {
      for (let i = reg.pools.length - 1; i >= 0; i--) if (reg.pools[i] === p) reg.pools.splice(i, 1);
      return;
    }
    const i = reg.pools.indexOf(p);
    if (i >= 0) reg.pools.splice(i, 1);
  };
  for (const p of [...pools, pools[2]!]) {
    push(p);
    out.push({ op: "register", size: reg.pools.length, capacity: reg.capacity, order: order(reg, pools) });
  }
  const absent = { __id: 99 } as unknown as HGPool_BasePool;
  for (const [label, victim] of [
    ["erase-dup", pools[2]!],
    ["erase-middle", pools[1]!],
    ["erase-last", pools[POOLS - 1]!],
    ["erase-absent", absent],
    ["erase-first", pools[0]!],
  ] as const) {
    erase(victim);
    out.push({ op: label, size: reg.pools.length, capacity: reg.capacity, order: order(reg, pools) });
  }
  return out;
}

function differences(a: Step[], b: Step[]): number {
  let n = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!, y = b[i]!;
    if (x.size !== y.size || x.capacity !== y.capacity ||
        x.order.join(",") !== y.order.join(",")) n++;
  }
  return n;
}

const controls: Record<string, number> = {
  "capacity = size+1 (no doubling)": differences(shipped, mutantDriver("no-double")),
  "reallocate on every push": differences(shipped, mutantDriver("grow-always")),
  "erase ALL matches, not the first": differences(shipped, mutantDriver("erase-all")),
};

// the controls ride on the last step so the Python side reads one JSON document
(shipped[shipped.length - 1] as Step & { controls?: unknown }).controls = controls;
process.stdout.write(JSON.stringify(shipped));
