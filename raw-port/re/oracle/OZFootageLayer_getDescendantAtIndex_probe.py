#!/usr/bin/env python3
"""OZFootageLayer_getDescendantAtIndex_probe.py — LIVE differential for
`OZFootageLayer::getDescendantAtIndex(unsigned int)` @Ozone 0x150bb0
(`__ZN14OZFootageLayer20getDescendantAtIndexEj`, an exported `T` symbol).

Run:  arch -x86_64 /usr/bin/python3 <this file>            (x86_64 is REQUIRED — every
      address in the port is transcribed from the x86_64 slice; the arm64 slice differs
      and an address-based differential fails silently toward VERIFIED.)

WHAT IT MEASURES, and why the function is oracle-able at all.

The body walks an intrusive doubly-linked list embedded in the layer at +0x438, following
the link word at +0x08 of each node, starting from the pointer at +0x440, and terminating
when the walk reaches the sentinel address (this+0x438). For each node it loads the payload
pointer at +0x10 and asks `__dynamic_cast(payload, OZSceneNode, OZSceneNodeFile, 0)`;
non-null answers are counted, and the walk stops when the count reaches `index`. So the
function dereferences NOTHING except memory this probe owns — the list nodes and the
payload's vptr — which means a fabricated arena is a complete environment for it.

The payloads are fabricated objects carrying a REAL typeinfo pointer in a fake vtable, so
`__dynamic_cast` runs its real algorithm over the real RTTI graph:
    slot[-1] = &typeinfo  (OZSceneNode  -> the cast FAILS, the node is not counted)
                          (OZSceneNodeFile -> the cast SUCCEEDS, the node is counted)
    slot[-2] = offset-to-top 0
That is what makes the counting path measurable without constructing a real scene graph.

Every case also byte-diffs the whole poisoned arena afterwards: the accessor must perform
NO stores, and a probe that only compared return values could not see an over-write.
"""
import ctypes, json, os, platform, subprocess, sys
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

FCP = "/Applications/Final Cut Pro.app/Contents"
OZONE = FCP + "/Frameworks/Ozone.framework/Versions/A/Ozone"
SYM = "_ZN14OZFootageLayer20getDescendantAtIndexEj"   # dlsym: no leading underscore
VA = 0x150BB0                                          # x86_64 slice, from army/inventory/Ozone.syms.txt

# The first 14 bytes of the transcribed prologue (@0x150bb0..0x150bbd). Asserted against the
# live image before anything is called: a wrong address measures a different function, and the
# only cheap defence is to check the bytes rather than the symbol name.
PROLOGUE = bytes([0x55, 0x48, 0x89, 0xE5, 0x41, 0x57, 0x41, 0x56, 0x41, 0x55, 0x41, 0x54, 0x53, 0x50])

if platform.machine() != "x86_64":
    sys.exit("REFUSING: running as %s — rerun under `arch -x86_64 /usr/bin/python3`" % platform.machine())

RPATHS = [FCP + "/Frameworks", FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
          "/Applications/Final Cut Pro.app/Contents/PlugIns", FCP + "/Frameworks/ProApps"]


def deps(path):
    out = subprocess.run(["otool", "-L", path], capture_output=True, text=True).stdout
    return [l.split()[0] for l in out.splitlines()[1:] if l.strip()]


def resolve(name):
    if name.startswith("@rpath/"):
        tail = name[len("@rpath/"):]
        for r in RPATHS:
            p = os.path.join(r, tail)
            if os.path.exists(p):
                return p
        return None
    return name if os.path.exists(name) else None


loaded, failed = set(), []


def preload(path, depth=0):
    if path in loaded or depth > 6:
        return
    loaded.add(path)
    for d in deps(path):
        rp = resolve(d)
        if rp and rp != path and rp not in loaded:
            preload(rp, depth + 1)
    try:
        ctypes.CDLL(path, mode=ctypes.RTLD_GLOBAL)
    except OSError as e:
        failed.append((os.path.basename(path), str(e).split(":")[-1].strip()[:60]))


preload(OZONE)
oz = ctypes.CDLL(OZONE, mode=ctypes.RTLD_GLOBAL)
print("preloaded %d images (%d failed)" % (len(loaded), len(failed)))
if failed:
    print("  failed:", failed[:5])

checks = []


def check(name, ok, detail=""):
    checks.append((name, bool(ok), detail))
    print("  %-58s %s  %s" % (name, "PASS" if ok else "FAIL", detail))


# ---------------------------------------------------------------- A. the function
fn = getattr(oz, SYM)
fn.restype = ctypes.c_void_p
fn.argtypes = [ctypes.c_void_p, ctypes.c_uint32]
addr = ctypes.cast(fn, ctypes.c_void_p).value
live = ctypes.string_at(addr, len(PROLOGUE))
check("A opcode self-check at the dlsym'd address", live == PROLOGUE,
      "%s vs %s" % (live.hex(), PROLOGUE.hex()))
if live != PROLOGUE:
    sys.exit("refusing to measure a function whose bytes are not the ones transcribed")

# ---------------------------------------------------------------- B. the RTTI graph
# Identify what lives at +0x10 inside an OZSceneNode: the body returns `payload + 0x10`
# (`leaq 0x10(%rcx),%rax` @0x150c2b), which is the Itanium null-preserving upcast to a base
# subobject. Reading the base table turns that from a guess into a citation.
libc = ctypes.CDLL(None)
libc.dlsym.restype = ctypes.c_void_p
libc.dlsym.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
RTLD_DEFAULT = ctypes.c_void_p(-2)


def dlsym(name):
    return libc.dlsym(RTLD_DEFAULT, name.encode())


def rd64(p):
    return ctypes.c_uint64.from_address(p).value


def rd32(p):
    return ctypes.c_uint32.from_address(p).value


def ti_name(ti):
    return ctypes.string_at(rd64(ti + 8)).decode()


def demangle(mangled):
    r = subprocess.run(["c++filt", "-n", "_ZTS" and mangled], capture_output=True, text=True)
    return r.stdout.strip() or mangled


TI_SCENENODE = dlsym("_ZTI11OZSceneNode")
TI_FILE = dlsym("_ZTI15OZSceneNodeFile")
check("B typeinfo for OZSceneNode / OZSceneNodeFile resolve",
      bool(TI_SCENENODE) and bool(TI_FILE),
      "%s / %s" % (hex(TI_SCENENODE or 0), hex(TI_FILE or 0)))

bases_at_0x10 = []
if TI_SCENENODE:
    vptr = rd64(TI_SCENENODE)
    kind = "?"
    for k, s in (("si", "_ZTVN10__cxxabiv120__si_class_type_infoE"),
                 ("vmi", "_ZTVN10__cxxabiv121__vmi_class_type_infoE"),
                 ("base", "_ZTVN10__cxxabiv117__class_type_infoE")):
        v = dlsym(s)
        if v and vptr == v + 16:
            kind = k
    print("  OZSceneNode typeinfo kind = %s (name %s)" % (kind, ti_name(TI_SCENENODE)))
    if kind == "vmi":
        nbases = rd32(TI_SCENENODE + 0x14)
        for i in range(nbases):
            bt = rd64(TI_SCENENODE + 0x18 + 16 * i)
            off_flags = ctypes.c_int64.from_address(TI_SCENENODE + 0x20 + 16 * i).value
            off = off_flags >> 8
            nm = ti_name(bt)
            print("    base %d: offset 0x%x  %s  (%s)" % (i, off, nm, demangle("_Z" + nm if not nm.startswith("_Z") else nm)))
            if off == 0x10:
                bases_at_0x10.append(nm)
    elif kind == "si":
        print("    single base at offset 0: %s" % ti_name(rd64(TI_SCENENODE + 0x10)))

# ---------------------------------------------------------------- C. the arena
ARENA = 0x600
SENT = 0x438          # the embedded list sentinel
STARTP = 0x440        # the sentinel's +0x08 link word = where the walk starts
POISON = 0xCD


def new_arena():
    return ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)


def w64(buf, off, val):
    ctypes.c_uint64.from_buffer(buf, off).value = val & 0xFFFFFFFFFFFFFFFF


NODE_SZ = 0x18


def make_vtable(ti):
    """A fake vtable: slot[-2] = offset-to-top 0, slot[-1] = &typeinfo, then a slot the code
    never calls. The object's +0x00 points at the FIRST virtual slot, as the ABI requires."""
    b = ctypes.create_string_buffer(0x20)
    ctypes.c_int64.from_buffer(b, 0).value = 0                       # offset-to-top
    ctypes.c_uint64.from_buffer(b, 8).value = ti                     # typeinfo
    ctypes.c_uint64.from_buffer(b, 16).value = 0xDEADBEEF            # slot 0 (never called)
    return b, ctypes.addressof(b) + 16


def make_payload(ti):
    """An object whose dynamic type is `ti`, with nothing else in it."""
    vt_buf, vt_ptr = make_vtable(ti)
    ob = ctypes.create_string_buffer(0x40)
    ctypes.c_uint64.from_buffer(ob, 0).value = vt_ptr
    return (vt_buf, ob), ctypes.addressof(ob)


def run_case(name, kinds, payloads, index, expect_kind, expect_i=None):
    """payloads: list of ints (0 for a NULL payload) — the +0x10 word of each list node.
    kinds:    the same list described symbolically, for the TypeScript driver."""
    keep = []
    arena = new_arena()
    base = ctypes.addressof(arena)
    sentinel = base + SENT
    nodes = []
    for _ in payloads:
        nb = ctypes.create_string_buffer(NODE_SZ)
        keep.append(nb)
        nodes.append(ctypes.addressof(nb))
    for i, (naddr, pv) in enumerate(zip(nodes, payloads)):
        nxt = nodes[i + 1] if i + 1 < len(nodes) else sentinel
        ctypes.c_uint64.from_address(naddr + 0x08).value = nxt
        ctypes.c_uint64.from_address(naddr + 0x10).value = pv
    w64(arena, STARTP, nodes[0] if nodes else sentinel)
    before = bytes(arena)
    got = fn(base, index)
    after = bytes(arena)
    unchanged = before == after

    # Resolve the returned pointer symbolically, so the live answer and the TypeScript answer are
    # the same KIND of statement and can be compared directly.
    if not got:
        answer = "NULL"
    else:
        answer = "UNKNOWN 0x%x" % got
        for i, pv in enumerate(payloads):
            if pv and got == pv + 0x10:
                answer = "payload[%d]+0x10" % i
                break

    want = "NULL" if expect_kind == "null" else "payload[%d]+0x10" % expect_i
    ok = answer == want
    check("C %-42s" % name, ok and unchanged,
          "%s (expected %s)" % (answer, want) + ("" if unchanged else "  ARENA MUTATED"))
    return {"case": name, "index": index, "kinds": kinds,
            "live": answer, "arena_unchanged": unchanged}


TRACE = []
# an ordinary non-null pointer that is never dereferenced on the index==0 path
FAKE = 0x1000

pf1, pf1a = make_payload(TI_FILE)
pf2, pf2a = make_payload(TI_FILE)
pf3, pf3a = make_payload(TI_FILE)
ps1, ps1a = make_payload(TI_SCENENODE)
ps2, ps2a = make_payload(TI_SCENENODE)

F, S, N, O = "FILE", "SCENE", "NULL", "OPAQUE"
TRACE.append(run_case("empty list, index 0", [], [], 0, "null"))
TRACE.append(run_case("empty list, index 3", [], [], 3, "null"))
TRACE.append(run_case("index 0, one NULL payload", [N], [0], 0, "null"))
TRACE.append(run_case("index 0, one payload", [O], [FAKE], 0, "ret", 0))
TRACE.append(run_case("index 0 ignores the payload type", [S], [ps1a], 0, "ret", 0))
TRACE.append(run_case("index 1, two NULL payloads (never counts)", [N, N], [0, 0], 1, "null"))
TRACE.append(run_case("index 1, casts all FAIL (never counts)", [S, S], [ps1a, ps2a], 1, "null"))
TRACE.append(run_case("index 1, first payload matches", [F, F], [pf1a, pf2a], 1, "ret", 1))
TRACE.append(run_case("index 2, three matches", [F, F, F], [pf1a, pf2a, pf3a], 2, "ret", 2))
TRACE.append(run_case("index 1, a non-match is skipped", [S, F, F], [ps1a, pf1a, pf2a], 1, "ret", 2))
TRACE.append(run_case("index 1, a NULL payload is skipped", [N, F, F], [0, pf1a, pf2a], 1, "ret", 2))
TRACE.append(run_case("index 2 with only 2 matches wraps to NULL", [F, F], [pf1a, pf2a], 2, "null"))

# ---------------------------------------------------------------- D. the TypeScript port
# Replay the SAME cases through raw-port/src/nodes/OZFootageLayer.ts and compare answer for answer.
# Without this section the probe would only establish the live semantics and leave the
# correspondence with the port to the reader — the shape most harnesses in this tree share, and the
# one that cannot catch a transcription slip at any corpus size.
DRIVER = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      "OZFootageLayer_getDescendantAtIndex_driver.mts")
ts_answers = {}
if os.path.exists(DRIVER):
    payload_in = json.dumps([{"case": t["case"], "index": t["index"], "kinds": t["kinds"]}
                             for t in TRACE])
    r = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                       input=payload_in, capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if r.returncode != 0:
        check("D the TypeScript port runs", False, (r.stderr or "")[-300:])
    else:
        try:
            rows = json.loads(r.stdout)
            ts_answers = {row["case"]: row["answer"] for row in rows}
            mut_rows = {row["case"]: row.get("mutants", {}) for row in rows}
            check("D the TypeScript port runs", True, "%d answers" % len(ts_answers))
        except Exception as e:                                   # noqa: BLE001
            check("D the TypeScript port runs", False, "%s: %s" % (e, r.stdout[:200]))
else:
    check("D the TypeScript port runs", False, "driver not found at %s" % DRIVER)

if ts_answers:
    diverged = []
    for t in TRACE:
        t["ts"] = ts_answers.get(t["case"], "<missing>")
        if t["ts"] != t["live"]:
            diverged.append("%s: live=%s ts=%s" % (t["case"], t["live"], t["ts"]))
    check("D live vs TypeScript, all %d cases" % len(TRACE), not diverged,
          "0 divergences" if not diverged else "; ".join(diverged[:3]))

    # E — what the corpus can KILL. A differential that no wrong port fails is not evidence.
    for m in ("M1", "M2", "M3"):
        killed = [t["case"] for t in TRACE if mut_rows.get(t["case"], {}).get(m) != t["live"]]
        for t in TRACE:
            t.setdefault("mutants", {})[m] = mut_rows.get(t["case"], {}).get(m)
        check("E negative control %s is killed" % m, bool(killed),
              "%d of %d cases disagree with the live binary" % (len(killed), len(TRACE)))

out = {"symbol": SYM, "va": hex(VA), "addr": hex(addr),
       "bases_of_OZSceneNode_at_0x10": bases_at_0x10, "cases": TRACE}
with open("/tmp/OZFootageLayer_getDescendantAtIndex_live.json", "w") as f:
    json.dump(out, f, indent=1)

nfail = sum(1 for _, ok, _ in checks if not ok)
print("\nRESULT: %s (%d failed of %d)" % ("PASS" if nfail == 0 else "FAIL", nfail, len(checks)))
print("live trace -> /tmp/OZFootageLayer_getDescendantAtIndex_live.json")
sys.exit(1 if nfail else 0)
