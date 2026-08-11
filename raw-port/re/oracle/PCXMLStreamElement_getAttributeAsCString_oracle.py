#!/usr/bin/env python3
"""Differential oracle for PCXMLStreamElement::getAttributeAsCString(unsigned int) const
   @ProCore 0x290f6  (__ZNK18PCXMLStreamElement21getAttributeAsCStringEj)

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/PCXMLStreamElement_getAttributeAsCString_oracle.py

Rosetta is required and enforced below: every @0xADDR in the port is an x86_64 offset, and a
native arm64 process would compare the port against code it did not transcribe — OPS_LOG,
"the executable oracle calls the wrong architecture ... it fails silently toward VERIFIED".

WHAT IS ACTUALLY BEING CHECKED. The method is pure memory traversal: a linear scan of a
7-entry inline array at +0x48 (live count at +0xb8) followed, on a miss, by an inlined
libc++ std::map<unsigned int, const char*>::find through the tree hanging off +0xc0. So the
harness builds REAL objects in process memory — a 0xc8-byte element arena and real 0x30-byte
__tree_nodes — hands the live symbol a pointer to one, and compares the `const char*` it
returns (as a raw 64-bit value) with the pointer this port returns for the same structure.
Nothing is dereferenced by the function, so the stored "strings" are arbitrary 64-bit
sentinels; identity of the returned pointer is exactly the contract.

Corpus shape, chosen so each decision in the body is exercised both ways:
  * count 0..7, with ALL SEVEN slots always populated — the unused ones hold STALE entries
    (the state a reused element is really in), so "respect the count" is testable rather
    than vacuous;
  * ids drawn from a pool containing 0x7fffffff / 0x80000000 / 0xffffffff, so an unsigned
    compare (`setb` @0x2913b, `jae` @0x29154) is distinguishable from a signed one;
  * map pointer null / empty tree / balanced tree / degenerate right-leaning chain;
  * queries that hit inline, hit the map, hit BOTH (inline must win), and miss everywhere;
  * stored values that are sometimes 0 (a legitimately stored NULL, indistinguishable from
    "not found" — worth pinning that the binary really does return it).

NEGATIVE CONTROLS are mandatory (OPS_LOG: "a dead negative control means your harness is
blind or your mutant is equivalent"). Each control below is a plausible mis-transcription of
THIS body; every one must be caught by the corpus, and the counts are printed.
"""
import ctypes
import glob
import json
import os
import platform
import random
import struct
import subprocess

# A driver that does not terminate is a mutant that was KILLED, not a pending result: two of them
# held a core for 2h31m before anyone noticed. See re/oracle/oracle_driver.py for the full account.
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))
import sys

SYM = "_ZNK18PCXMLStreamElement21getAttributeAsCStringEj"  # dlsym: no leading underscore
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TS_DRIVER = os.path.join(REPO, "raw-port", "re", "oracle",
                         "PCXMLStreamElement_getAttributeAsCString_driver.ts")

OBJ_SIZE = 0xC8          # through the +0xc0 map pointer
OFF_SLOTS = 0x48         # 7 x {u32 id @+0x00, const char* value @+0x08}
SLOT_STRIDE = 0x10
N_SLOTS = 7              # addAttribute @0x29008: `cmpq $0x6, %rax; ja` -> spill at 7
OFF_COUNT = 0xB8
OFF_MAP = 0xC0
MAP_SIZE = 0x18          # operator new(0x18) @0x2903b
NODE_SIZE = 0x30
NODE_LEFT, NODE_RIGHT, NODE_PARENT, NODE_BLACK, NODE_KEY, NODE_VAL = 0x00, 0x08, 0x10, 0x18, 0x20, 0x28
POISON = 0xCD

ID_POOL = [0, 1, 2, 3, 5, 8, 13, 21, 0x7FFFFFFE, 0x7FFFFFFF, 0x80000000, 0x80000001,
           0xFFFFFFFE, 0xFFFFFFFF]


def load_with_rpath(path, seen=None):
    """Preload the @rpath chain depth-first, then the target (OPS_LOG: no DYLD_* on hardened python)."""
    seen = seen if seen is not None else set()
    real = os.path.realpath(path)
    if real in seen:
        return None
    seen.add(real)
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    for line in out.splitlines()[1:]:
        dep = line.strip().split(" (")[0]
        if dep.startswith("@rpath/"):
            cand = os.path.join(fwdir, dep[len("@rpath/"):])
            if os.path.exists(cand):
                try:
                    load_with_rpath(cand, seen)
                except OSError:
                    pass
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


# ─── corpus ────────────────────────────────────────────────────────────────────────────────

def build_tree(rng, keys, shape):
    """Return (root_index, nodes) with nodes = [{l, r, key, val}], a valid BST over `keys`."""
    nodes = []

    def add(k):
        nodes.append({"l": -1, "r": -1, "key": k,
                      "val": 0 if rng.random() < 0.08 else rng.getrandbits(64)})
        return len(nodes) - 1

    keys = sorted(set(keys))
    if not keys:
        return -1, []

    if shape == "chain":
        # Degenerate right-leaning chain: exercises a deep descent where the
        # lower_bound candidate is only ever updated at the very end.
        idxs = [add(k) for k in keys]
        for a, b in zip(idxs, idxs[1:]):
            nodes[a]["r"] = b
        return idxs[0], nodes

    def build(lo, hi):
        if lo > hi:
            return -1
        mid = (lo + hi) // 2
        i = add(keys[mid])
        nodes[i]["l"] = build(lo, mid - 1)
        nodes[i]["r"] = build(mid + 1, hi)
        return i

    root = build(0, len(keys) - 1)
    return root, nodes


def build_cases(seed=0x290F6, count=800):
    rng = random.Random(seed)
    cases = []
    for _ in range(count):
        n = rng.randrange(0, N_SLOTS + 1)
        slots = [{"id": rng.choice(ID_POOL),
                  "val": 0 if rng.random() < 0.08 else rng.getrandbits(64)}
                 for _ in range(N_SLOTS)]

        roll = rng.random()
        if roll < 0.30:
            mp = None                                    # +0xc0 == nullptr
        elif roll < 0.42:
            mp = {"root": -1, "nodes": []}               # allocated but empty tree
        else:
            shape = "chain" if rng.random() < 0.25 else "balanced"
            k = rng.randrange(1, 10)
            keys = [rng.choice(ID_POOL) for _ in range(k)]
            root, nodes = build_tree(rng, keys, shape)
            mp = {"root": root, "nodes": nodes}

        # Bias the query toward ids that are actually present, so hits and misses
        # are both common (a corpus of pure misses would pass a port that never
        # reads a value at all).
        pool = [s["id"] for s in slots[:n]]
        if mp:
            pool += [nd["key"] for nd in mp["nodes"]]
        q = rng.choice(pool) if pool and rng.random() < 0.65 else rng.choice(ID_POOL)

        cases.append({"n": n, "slots": slots, "map": mp, "q": q})
    return cases


# ─── the live binary ───────────────────────────────────────────────────────────────────────

def materialize(case):
    """Build the real element arena (+ tree nodes) and return (addr, keepalive_list)."""
    keep = []
    obj = ctypes.create_string_buffer(bytes([POISON]) * OBJ_SIZE, OBJ_SIZE)
    keep.append(obj)
    for i, s in enumerate(case["slots"]):
        struct.pack_into("<I", obj, OFF_SLOTS + i * SLOT_STRIDE, s["id"])
        struct.pack_into("<Q", obj, OFF_SLOTS + i * SLOT_STRIDE + 8, s["val"])
    struct.pack_into("<I", obj, OFF_COUNT, case["n"])

    if case["map"] is None:
        struct.pack_into("<Q", obj, OFF_MAP, 0)
    else:
        node_bufs = []
        for _ in case["map"]["nodes"]:
            nb = ctypes.create_string_buffer(bytes([POISON]) * NODE_SIZE, NODE_SIZE)
            node_bufs.append(nb)
            keep.append(nb)
        for nb, nd in zip(node_bufs, case["map"]["nodes"]):
            struct.pack_into("<Q", nb, NODE_LEFT,
                             0 if nd["l"] < 0 else ctypes.addressof(node_bufs[nd["l"]]))
            struct.pack_into("<Q", nb, NODE_RIGHT,
                             0 if nd["r"] < 0 else ctypes.addressof(node_bufs[nd["r"]]))
            struct.pack_into("<Q", nb, NODE_PARENT, 0)
            struct.pack_into("<B", nb, NODE_BLACK, 1)
            struct.pack_into("<I", nb, NODE_KEY, nd["key"])
            struct.pack_into("<Q", nb, NODE_VAL, nd["val"])

        mb = ctypes.create_string_buffer(bytes([POISON]) * MAP_SIZE, MAP_SIZE)
        keep.append(mb)
        root = case["map"]["root"]
        struct.pack_into("<Q", mb, 0x00, ctypes.addressof(mb) + 0x08)   # __begin_node_
        struct.pack_into("<Q", mb, 0x08,
                         0 if root < 0 else ctypes.addressof(node_bufs[root]))
        struct.pack_into("<Q", mb, 0x10, len(case["map"]["nodes"]))     # __size_
        struct.pack_into("<Q", obj, OFF_MAP, ctypes.addressof(mb))

    return ctypes.addressof(obj), keep


def run_native(cases, fn):
    out = []
    for c in cases:
        addr, keep = materialize(c)
        out.append(fn(ctypes.c_void_p(addr), ctypes.c_uint32(c["q"])) & 0xFFFFFFFFFFFFFFFF)
        del keep
    return out


def run_ts(cases):
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    wire = [{"n": c["n"],
             "slots": [{"id": s["id"], "val": "%016x" % s["val"]} for s in c["slots"]],
             "map": None if c["map"] is None else {
                 "root": c["map"]["root"],
                 "nodes": [{"l": nd["l"], "r": nd["r"], "key": nd["key"],
                            "val": "%016x" % nd["val"]} for nd in c["map"]["nodes"]]},
             "q": c["q"]}
            for c in cases]
    p = subprocess.run([tsx, TS_DRIVER], input=json.dumps(wire), capture_output=True,
                       text=True, cwd=os.path.join(REPO, "raw-port"), timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    return [int(h, 16) for h in json.loads(p.stdout.strip().splitlines()[-1])]


# ─── python reference model + its mutants (negative controls) ──────────────────────────────

def lower_bound(case, q, cmov_ge=True, dir_key_lt_goes_right=True, signed=False):
    """The @0x29136 descent. Returns the candidate node dict, or None for the end sentinel."""
    def lt(a, b):
        if signed:
            a = a - 0x100000000 if a >= 0x80000000 else a
            b = b - 0x100000000 if b >= 0x80000000 else b
        return a < b

    mp = case["map"]
    if mp is None or mp["root"] < 0:
        return None
    nodes = mp["nodes"]
    cur, cand = mp["root"], None
    depth = 0
    while cur >= 0 and depth < 128:
        depth += 1
        nd = nodes[cur]
        key_lt = lt(nd["key"], q)
        take = (not key_lt) if cmov_ge else key_lt
        if take:
            cand = nd
        go_right = key_lt if dir_key_lt_goes_right else (not key_lt)
        cur = nd["r"] if go_right else nd["l"]
    return cand


def model(case, *, inline_first=True, use_inline=True, scan_all=False, count_delta=0,
          cmov_ge=True, dir_key_lt_goes_right=True, final_strict=False, signed=False):
    q = case["q"]

    def inline_lookup():
        if not use_inline:
            return None
        n = N_SLOTS if scan_all else max(0, min(N_SLOTS, case["n"] + count_delta))
        for s in case["slots"][:n]:
            if s["id"] == q:
                return s["val"]
        return None

    def map_lookup():
        cand = lower_bound(case, q, cmov_ge=cmov_ge,
                           dir_key_lt_goes_right=dir_key_lt_goes_right, signed=signed)
        if cand is None:
            return None
        if signed:
            a = q - 0x100000000 if q >= 0x80000000 else q
            b = cand["key"] - 0x100000000 if cand["key"] >= 0x80000000 else cand["key"]
        else:
            a, b = q, cand["key"]
        hit = (a > b) if final_strict else (a >= b)
        return cand["val"] if hit else None

    order = (inline_lookup, map_lookup) if inline_first else (map_lookup, inline_lookup)
    for step in order:
        v = step()
        if v is not None:
            return v
    return 0


CONTROLS = [
    ("map consulted BEFORE the inline array (0x29107 loop moved after 0x29116)",
     lambda c: model(c, inline_first=False)),
    ("inline array ignored entirely — map-only lookup",
     lambda c: model(c, use_inline=False)),
    ("all 7 slots scanned, +0xb8 count ignored (stale entries become live)",
     lambda c: model(c, scan_all=True)),
    ("count off by one (`cmpq %rcx,%rax` boundary read as <=)",
     lambda c: model(c, count_delta=1)),
    ("cmovaeq @0x2913f inverted — candidate tracks key < id (upper bound, not lower)",
     lambda c: model(c, cmov_ge=False)),
    ("descent direction inverted at @0x29143 (dil used as left-index)",
     lambda c: model(c, dir_key_lt_goes_right=False)),
    ("jae @0x29154 read as ja — strict >, so an exact key never matches",
     lambda c: model(c, final_strict=True)),
    ("SIGNED compares instead of setb/jae's unsigned CF",
     lambda c: model(c, signed=True)),
]


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    lib = load_with_rpath(os.path.join(fwdir, "ProCore.framework", "ProCore"))
    fn = getattr(lib, SYM)
    fn.restype = ctypes.c_uint64
    fn.argtypes = [ctypes.c_void_p, ctypes.c_uint32]

    cases = build_cases()
    native = run_native(cases, fn)
    ts = run_ts(cases)

    bad = [i for i in range(len(cases)) if native[i] != ts[i]]
    nonnull = sum(1 for v in native if v != 0)
    inline_hits = sum(1 for c in cases
                      if any(s["id"] == c["q"] for s in c["slots"][:c["n"]]))
    map_hits = sum(1 for c in cases
                   if c["map"] and any(nd["key"] == c["q"] for nd in c["map"]["nodes"]))
    both = sum(1 for c in cases
               if any(s["id"] == c["q"] for s in c["slots"][:c["n"]])
               and c["map"] and any(nd["key"] == c["q"] for nd in c["map"]["nodes"]))
    print(f"cases={len(cases)}  native non-null={nonnull}  null={len(cases) - nonnull}  "
          f"inline-hits={inline_hits}  map-hits={map_hits}  both(inline must win)={both}  "
          f"divergences={len(bad)}")
    for i in bad[:10]:
        c = cases[i]
        print(f"  case {i}: native=0x{native[i]:016x} ts=0x{ts[i]:016x}  q={c['q']:#x} "
              f"n={c['n']} map={'null' if c['map'] is None else len(c['map']['nodes'])} nodes")

    ref_bad = sum(1 for i, c in enumerate(cases) if model(c) != native[i])
    print(f"python reference model vs live: {ref_bad} mismatches "
          f"(a non-zero here means the model, not the port, is wrong)")

    print("NEGATIVE CONTROLS (each is a plausible mis-read of this body; a 0 would mean the "
          "corpus is blind or the mutant is equivalent):")
    dead = []
    for name, f in CONTROLS:
        wrong = sum(1 for i, c in enumerate(cases) if f(c) != native[i])
        if wrong == 0:
            dead.append(name)
        print(f"  {wrong:6d}/{len(cases)} wrong — {name}")
    for name in dead:
        print(f"  !! DEAD CONTROL: {name}")

    ok = not bad and ref_bad == 0 and not dead
    print("VERIFIED vs live ProCore" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
