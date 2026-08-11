#!/usr/bin/env python3
"""symidx.py — byte-offset index over the cached `otool -tV` disassembly dumps.

WHY THIS EXISTS
---------------
Every disasm lookup used to be a LINEAR SCAN of /tmp/<FW>_tV.txt:

    awk -v s="$SYM:" '$0==s{f=1;print;next} f&&/:$/{exit} f{print}' /tmp/Flexo_tV.txt

Those dumps are big — Flexo 210MB, Ozone 77MB, Helium 41MB (367MB total) — and the scan runs
several times per ported unit: the worker's disasm.sh, g5_impl_gate re-deriving inside gate.sh,
and the reviewer independently re-deriving at review time. `disasm_class.sh` was even worse: one
full scan PER METHOD of the class.

On the corp laptop a single full scan of Flexo_tV.txt measured:

    real 42.33   user 7.25   sys 0.45

42s wall for 7.7s of CPU. The missing ~35s is the read being held while the MDM file-inspection
stack (Microsoft Defender wdavdaemon/epsext, Microsoft DLP dlpdaemon, Cyberhaven, uberAgent)
examines every byte streamed. That is what pinned the box at load 119 with 31% CPU IDLE — agents
parked in uninterruptible I/O behind the scan filters, not burning CPU. It capped the usable swarm
at ~4 slots, far below the 16-slot warm-pool ceiling the harness is designed for.

WHAT THIS DOES
--------------
One sequential pass per framework records, for every `__Z...:` label, the byte offset and byte
length of its body. Lookups then SEEK to the symbol and read only its bytes — a few KB instead of
~100MB average (a full 210MB read whenever the symbol is absent). ~10,000x fewer bytes through the
scan filters per lookup, so the per-unit disasm cost stops scaling with dump size.

The index is a derived cache: it is keyed to the dump's (size, mtime) and silently rebuilt when
those change, so it can never serve bytes from a stale dump.

WHAT THIS DELIBERATELY DOES NOT CHANGE
--------------------------------------
The BYTES. `slice` is byte-for-byte identical to the awk pipeline it replaces, including the
boundary rule (body runs from the label line to the line before the next line ending in ':') and
first-occurrence-wins on a duplicated label. This is load-bearing: the adversarial property in
REVIEWER_BRIEF/G5 — the reviewer re-deriving disasm from the binary rather than trusting a
committed .s — is preserved exactly. This makes the haystack cheap to search; it does not make the
needle different, and callers keep their objdump/ICF fallbacks unchanged.

USAGE
    symidx.py build <FW> [--force]   build/refresh the index (one full pass; ~40s cold on Flexo)
    symidx.py slice <FW> <SYM>       write that symbol's body to stdout (exit 3 = symbol absent)
    symidx.py status [FW ...]        show index freshness per framework

Exit codes for `slice`: 0 = wrote body, 3 = symbol not in dump (caller should fall back to its
objdump path, exactly as it does for a 0-line awk result), 4 = dump missing.
"""
import os, sys, sqlite3, time

FWS = ["ProCore", "ProChannel", "Helium", "Ozone", "Flexo"]

def dump_path(fw):  return f"/tmp/{fw}_tV.txt"
def idx_path(fw):   return f"/tmp/{fw}_symidx.sqlite"
def lock_path(fw):  return f"/tmp/{fw}_symidx.lock"

# A label line is a bare `__Z...:` symbol label. A BOUNDARY is any line ending in ':' — this mirrors
# awk's `/:$/` exit condition exactly, so bodies end where the awk pipeline ended them.
def _is_label(line):
    return line.startswith("__Z") and line.endswith(":")

def _src_stamp(fw):
    st = os.stat(dump_path(fw))
    return st.st_size, int(st.st_mtime)


def build(fw, force=False):
    src = dump_path(fw)
    if not os.path.exists(src) or os.path.getsize(src) == 0:
        print(f"symidx: no dump at {src}", file=sys.stderr); return 4
    if not force and fresh(fw):
        print(f"symidx: {fw} index already fresh", file=sys.stderr); return 0

    # Single-builder guard: concurrent agents must not each burn a full pass over a 210MB file.
    # Atomic mkdir; a loser waits for the winner's index rather than duplicating the work.
    lk = lock_path(fw)
    try:
        os.mkdir(lk)
    except FileExistsError:
        # Stale lock (builder died) after 15 min, else wait for the winner.
        try:
            if time.time() - os.stat(lk).st_mtime > 900:
                os.utime(lk, None)
            else:
                deadline = time.time() + 900
                while time.time() < deadline:
                    time.sleep(2)
                    if fresh(fw):
                        print(f"symidx: {fw} built by a concurrent builder", file=sys.stderr); return 0
                print(f"symidx: timed out waiting for concurrent build of {fw}", file=sys.stderr); return 5
        except FileNotFoundError:
            pass

    try:
        size, mtime = _src_stamp(fw)
        tmp = idx_path(fw) + f".tmp{os.getpid()}"
        if os.path.exists(tmp): os.unlink(tmp)
        db = sqlite3.connect(tmp)
        db.execute("PRAGMA journal_mode=OFF")
        db.execute("PRAGMA synchronous=OFF")
        db.execute("CREATE TABLE sym (name TEXT PRIMARY KEY, off INTEGER, len INTEGER)")
        db.execute("CREATE TABLE meta (k TEXT PRIMARY KEY, v TEXT)")

        rows, n, dupes = [], 0, 0
        seen = set()
        cur_name, cur_off = None, 0
        pos = 0
        # Binary mode + manual offset accounting: we need exact BYTE offsets, and the dumps contain
        # occasional non-UTF8 bytes in string literals that would break text-mode decoding.
        with open(src, "rb") as f:
            for raw in f:
                ln = len(raw)
                line = raw.rstrip(b"\n").decode("utf-8", "replace")
                if cur_name is not None and line.endswith(":"):
                    rows.append((cur_name, cur_off, pos - cur_off))
                    cur_name = None
                if _is_label(line):
                    name = line[:-1]
                    if name in seen:
                        dupes += 1          # first occurrence wins, matching awk
                    else:
                        seen.add(name)
                        cur_name, cur_off = name, pos
                pos += ln
        if cur_name is not None:
            rows.append((cur_name, cur_off, pos - cur_off))
        n = len(rows)

        db.executemany("INSERT OR IGNORE INTO sym VALUES (?,?,?)", rows)
        db.executemany("INSERT INTO meta VALUES (?,?)",
                       [("src_size", str(size)), ("src_mtime", str(mtime)),
                        ("built_at", str(int(time.time()))), ("nsym", str(n))])
        db.commit(); db.close()
        os.replace(tmp, idx_path(fw))       # atomic: readers see old or new, never a partial index
        print(f"symidx: {fw} indexed {n} symbols ({dupes} dup labels skipped) from {size/1e6:.0f}MB",
              file=sys.stderr)
        return 0
    finally:
        try: os.rmdir(lk)
        except OSError: pass


def fresh(fw):
    """True iff an index exists and matches the dump's current (size, mtime)."""
    ip = idx_path(fw)
    if not os.path.exists(ip) or not os.path.exists(dump_path(fw)): return False
    try:
        size, mtime = _src_stamp(fw)
        db = sqlite3.connect(f"file:{ip}?mode=ro", uri=True)
        m = dict(db.execute("SELECT k,v FROM meta").fetchall())
        db.close()
        return m.get("src_size") == str(size) and m.get("src_mtime") == str(mtime)
    except Exception:
        return False


def slice_sym(fw, sym, out=None):
    src = dump_path(fw)
    if not os.path.exists(src):
        print(f"symidx: no dump at {src}", file=sys.stderr); return 4
    if not fresh(fw):
        rc = build(fw)
        if rc != 0: return rc
    db = sqlite3.connect(f"file:{idx_path(fw)}?mode=ro", uri=True)
    row = db.execute("SELECT off,len FROM sym WHERE name=?", (sym,)).fetchone()
    db.close()
    if not row:
        return 3                            # absent: caller falls back to objdump, as before
    off, ln = row
    with open(src, "rb") as f:
        f.seek(off)
        data = f.read(ln)
    (out or sys.stdout.buffer).write(data)
    return 0


def status(fws):
    for fw in fws:
        src, ip = dump_path(fw), idx_path(fw)
        if not os.path.exists(src):
            print(f"  {fw:<12} no dump"); continue
        mb = os.path.getsize(src) / 1e6
        if not os.path.exists(ip):
            print(f"  {fw:<12} dump {mb:6.0f}MB   NO INDEX (lookups will full-scan)"); continue
        db = sqlite3.connect(f"file:{ip}?mode=ro", uri=True)
        m = dict(db.execute("SELECT k,v FROM meta").fetchall())
        db.close()
        print(f"  {fw:<12} dump {mb:6.0f}MB   index {m.get('nsym','?')} syms   "
              f"{'FRESH' if fresh(fw) else 'STALE (will rebuild)'}")


def main():
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr); return 2
    cmd = sys.argv[1]
    if cmd == "build":
        if len(sys.argv) < 3: print("usage: symidx.py build <FW> [--force]", file=sys.stderr); return 2
        fws = FWS if sys.argv[2] == "all" else [sys.argv[2]]
        force = "--force" in sys.argv
        rc = 0
        for fw in fws: rc |= build(fw, force)
        return rc
    if cmd == "slice":
        if len(sys.argv) < 4: print("usage: symidx.py slice <FW> <SYM>", file=sys.stderr); return 2
        return slice_sym(sys.argv[2], sys.argv[3])
    if cmd == "status":
        status(sys.argv[2:] or FWS); return 0
    print(__doc__, file=sys.stderr); return 2

if __name__ == "__main__":
    sys.exit(main())
