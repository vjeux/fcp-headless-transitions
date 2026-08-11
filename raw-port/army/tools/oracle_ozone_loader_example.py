#!/usr/bin/env python3
"""oracle_ozone_loader_example.py — WORKED EXAMPLE: load Ozone outside the app bundle and run a
memory-mutation differential against live FCP. Kept in-tree because two agents have now had to
re-derive the @rpath preload recipe, and because "the framework will not load" and "this method has
no return value" are the two reasons ports get signed on reading alone.

The function oracled here is OZScene::clearTemporaryFilesPersistence() @Ozone 0x313d00.

Run: arch -x86_64 /usr/bin/python3 /tmp/w1_oracle_ozscene.py

Ozone only resolves its @rpath chain when its dependencies are already in the process, so this
walks `otool -L` depth-first and CDLLs each dependency by absolute path before loading Ozone
(OPS_LOG, worker 1, 2026-08-10). The symbol is `T`, so it is dlsym-able once Ozone is in.
"""
import ctypes, os, platform, re, subprocess, sys, json, random

FCP = "/Applications/Final Cut Pro.app/Contents"
OZONE = FCP + "/Frameworks/Ozone.framework/Versions/A/Ozone"
SYM = "_ZN7OZScene30clearTemporaryFilesPersistenceEv"   # dlsym wants it WITHOUT the leading _

if platform.machine() != "x86_64":
    sys.exit("REFUSING: %s — rerun under `arch -x86_64 /usr/bin/python3`" % platform.machine())

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
print("preloaded %d images (%d failed)" % (len(loaded), len(failed)))
oz = ctypes.CDLL(OZONE, mode=ctypes.RTLD_GLOBAL)
fn = getattr(oz, SYM)
fn.restype = None
fn.argtypes = [ctypes.c_void_p]
print("resolved %s" % SYM)

# ---- build a synthetic OZScene with a real libc++ __tree at +0x608 -------------------------
NODE = 0x38            # __left_, __right_, __parent_, __is_black_, key(16), value...
SCENE = 0x800
POISON = 0xCD

class Tree:
    """Mirror of the structure handed to both sides."""
    def __init__(self, n, seed):
        rnd = random.Random(seed)
        self.n = n
        self.buf = ctypes.create_string_buffer(POISON.to_bytes(1, "little") * (SCENE + NODE * n))
        self.base = ctypes.addressof(self.buf)
        self.nodes = [self.base + SCENE + i * NODE for i in range(n)]
        # zero the scene and the nodes' pointer words, then build a BST over keys 0..n-1
        ctypes.memset(self.base, 0, SCENE)
        for a in self.nodes:
            ctypes.memset(a, 0, NODE)
        self.flags = [rnd.choice([1, 1, 1, 0xFF]) for _ in range(n)]
        for i, a in enumerate(self.nodes):
            ctypes.memset(a + 0x30, self.flags[i], 1)
        self.end = self.base + 0x610
        order = list(range(n))
        self.parent = {}; self.left = {}; self.right = {}
        root = self._insert(order)
        self._w(self.end, root)                       # __end_node_.__left_ = root
        self._w(root + 0x10, self.end)                # root->__parent_ = &__end_node_
        self._w(self.base + 0x608, self.nodes[0])     # __begin_node_ = leftmost = key 0

    def _w(self, at, val):
        ctypes.memmove(at, ctypes.byref(ctypes.c_uint64(val)), 8)

    def _insert(self, keys):
        """Balanced BST over the sorted key list, wired with libc++ pointer conventions."""
        def build(lo, hi, parent):
            if lo > hi:
                return 0
            mid = (lo + hi) // 2
            me = self.nodes[mid]
            l = build(lo, mid - 1, me)
            r = build(mid + 1, hi, me)
            self._w(me + 0x00, l)
            self._w(me + 0x08, r)
            self._w(me + 0x10, parent)
            self.left[mid] = l; self.right[mid] = r; self.parent[mid] = parent
            return me
        return build(0, len(keys) - 1, 0)

    def snapshot(self):
        return bytes(self.buf)

    def flags_now(self):
        return [ctypes.string_at(a + 0x30, 1)[0] for a in self.nodes]

    def as_json(self):
        idx = {a: i for i, a in enumerate(self.nodes)}
        def ptr(at):
            v = int.from_bytes(ctypes.string_at(at, 8), "little")
            return idx.get(v, None) if v != self.end else "END"
        return {"begin": idx.get(int.from_bytes(ctypes.string_at(self.base + 0x608, 8), "little")),
                "nodes": [{"left": ptr(a), "right": ptr(a + 8), "parent": ptr(a + 0x10),
                           "flag": ctypes.string_at(a + 0x30, 1)[0]} for a in self.nodes]}

ok = True
for n, seed in ((1, 1), (2, 2), (3, 3), (7, 7), (16, 16), (31, 31)):
    t = Tree(n, seed)
    before = t.snapshot()
    spec = t.as_json()
    fn(ctypes.c_void_p(t.base))
    after = t.snapshot()
    flags = t.flags_now()
    # every entry cleared?
    cleared = all(f == 0 for f in flags)
    # nothing else touched? compare byte-for-byte, ignoring the +0x30 of each node
    b = bytearray(before); a = bytearray(after)
    for node in t.nodes:
        off = node - t.base
        b[off + 0x30] = a[off + 0x30] = 0
    untouched = (bytes(b) == bytes(a))
    good = cleared and untouched
    ok &= good
    print("n=%-3d cleared=%-5s no-other-writes=%-5s  %s" % (n, cleared, untouched,
                                                            "MATCH" if good else "MISMATCH"))
    json.dump(spec, open("/tmp/w1_ozscene_case_%d.json" % n, "w"))

# empty map: __begin_node_ == &__end_node_ -> must be a pure no-op
t = Tree(1, 99)
t._w(t.base + 0x608, t.end)
before = t.snapshot(); fn(ctypes.c_void_p(t.base)); after = t.snapshot()
noop = before == after
ok &= noop
print("empty map (begin == end): untouched=%s  %s" % (noop, "MATCH" if noop else "MISMATCH"))

print("\nORACLE:", "VERIFIED" if ok else "DIVERGED")
sys.exit(0 if ok else 1)
