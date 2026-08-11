#!/usr/bin/env python3
"""srcsource.py — where the src/*.ts corpus is read from, and the per-file cache over it.

TWO PROBLEMS THIS EXISTS TO FIX, both measured on the live swarm (2026-08-11):

1. **The working tree is the wrong source during a swarm run.** `mark_ported.py` and
   `build_ledger.py` scanned `<canonical>/raw-port/src` — the checkout's WORKING TREE — but nothing
   advances that tree while the swarm runs: `swarm_maint.sh` only resets it when it is dirty AND no
   gate process is live, and agents work in pool worktrees, never in the canonical checkout. It was
   measured 9, then 26, then 30 commits behind `origin/main` over one morning, so every reconcile
   printed a healthy-looking `0 units changed` while silently ignoring every port that had landed.
   Reading from a REF fixes it at the root: `origin/main` is what "landed" means, it needs no lock,
   and it cannot race an agent mid-write.

2. **Re-reading 1,625 files (27.7 MB) per run.** Every caller wants per-file facts that depend only
   on that file's CONTENT. Keyed by git blob sha (exact, free — `ls-tree` already reports it) the
   cache turns the run after a single merge into "read one file", not 1,625. On this box the corp
   security stack rescans every file open, so avoided reads are worth several times their wall-clock.

Cache lives in `army/cache/` (gitignored regenerable state) and is keyed by
`(cache_name, blob_sha)`, so it is correct across branches, rebases and reverts without any
invalidation logic: different content is a different key, full stop.
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # raw-port/
REPO = os.path.dirname(ROOT)
CACHE_DIR = os.path.join(ROOT, "army", "cache")

# The ref whose src/ is "what has landed". Overridable for one-off analysis of a branch or of the
# working tree (`FCT_SRC_REF=WORKTREE`), but the default is deliberately NOT the working tree.
DEFAULT_REF = os.environ.get("FCT_SRC_REF", "origin/main")


def _git(*args):
    return subprocess.run(
        ["git", "-C", REPO] + list(args), capture_output=True, text=True
    )


def ref_exists(ref):
    return _git("rev-parse", "--verify", "--quiet", f"{ref}^{{commit}}").returncode == 0


def effective_ref(ref=None):
    """What `iter_src(ref)` will ACTUALLY read: the ref itself, or "WORKTREE" if it falls back.

    Callers that print which source they used must print THIS, not the ref they asked for. See the
    fallback warning in `iter_src`: reporting the requested ref makes the diagnostic line assert
    `origin/main` in precisely the case where the numbers came from the working tree.
    """
    ref = ref or DEFAULT_REF
    return "WORKTREE" if (ref == "WORKTREE" or not ref_exists(ref)) else ref


def iter_src(ref=None):
    """Yield (relpath, blob_key, text) for every `raw-port/src/**/*.ts`.

    `ref=None` uses DEFAULT_REF (`origin/main`); `ref="WORKTREE"` reads the working tree, which is
    what the callers used to do unconditionally — kept as an escape hatch, not as the default.
    `blob_key` identifies the CONTENT: a git blob sha for a ref, or `mtime_ns:size` for the working
    tree (weaker, but the working tree has no content id and hashing it would cost the read we are
    trying to avoid).
    """
    ref = ref or DEFAULT_REF
    # A ref that does not resolve falls back to the working tree — but SILENTLY, which reviewer 1
    # correctly flagged on #506: the defect this module exists to fix is "silently reconciled a stale
    # tree", and an unresolvable `origin/main` (a fresh clone with no fetch, a renamed remote) would
    # reintroduce exactly that, reporting a confident count from whatever the tree happened to hold.
    # The fallback still happens — a reconcile that refuses to run is worse than one that runs on the
    # tree — but it now says so, on stderr, naming the ref it wanted.
    if ref != "WORKTREE" and not ref_exists(ref):
        print(f"srcsource: WARNING — ref {ref!r} does not resolve; falling back to the WORKING TREE, "
              f"which during a swarm run is stale (that is the bug this default exists to avoid). "
              f"Run `git fetch origin` first, or pass FCT_SRC_REF=WORKTREE to mean it.",
              file=sys.stderr)
    if ref == "WORKTREE" or not ref_exists(ref):
        src = os.path.join(ROOT, "src")
        for dirpath, _dirnames, filenames in os.walk(src):
            for fn in sorted(filenames):
                if not fn.endswith(".ts"):
                    continue
                p = os.path.join(dirpath, fn)
                try:
                    st = os.stat(p)
                    text = open(p, encoding="utf-8", errors="replace").read()
                except Exception:
                    continue
                yield os.path.relpath(p, REPO), f"wt:{st.st_mtime_ns}:{st.st_size}", text
        return

    # One `ls-tree` for the (path, sha) list, then ONE `cat-file --batch` for every blob: two
    # processes total, rather than a `git show` per file.
    lst = _git("ls-tree", "-r", ref, "--", "raw-port/src")
    entries = []
    for line in lst.stdout.splitlines():
        meta, _, path = line.partition("\t")
        parts = meta.split()
        if len(parts) < 3 or parts[1] != "blob" or not path.endswith(".ts"):
            continue
        entries.append((path, parts[2]))
    if not entries:
        return
    proc = subprocess.Popen(
        ["git", "-C", REPO, "cat-file", "--batch"],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE,
    )
    try:
        out = proc.communicate(("\n".join(sha for _p, sha in entries) + "\n").encode())[0]
    finally:
        proc.wait()
    off = 0
    for path, sha in entries:
        nl = out.find(b"\n", off)
        if nl < 0:
            break
        header = out[off:nl].split()
        if len(header) < 3:
            break
        size = int(header[2])
        body = out[nl + 1: nl + 1 + size]
        off = nl + 1 + size + 1  # trailing newline after each blob
        yield path, sha, body.decode("utf-8", errors="replace")


class FileCache:
    """Per-file results keyed by content id. `compute(path, text)` runs only on a miss.

    Values must be JSON-round-trippable; a `decode` hook rebuilds any richer type (a set, say) that
    JSON flattens. Writes are atomic (temp + os.replace) because several agents may reconcile at
    once — the same race that forced atomic ledger writes.
    """

    def __init__(self, name, version=1):
        self.path = os.path.join(CACHE_DIR, f"{name}.v{version}.json")
        self.data = {}
        try:
            with open(self.path) as f:
                self.data = json.load(f)
        except Exception:
            self.data = {}
        self.dirty = False

    def get_or_compute(self, blob_key, path, text, compute):
        hit = self.data.get(blob_key)
        if hit is not None:
            return hit
        val = compute(path, text)
        self.data[blob_key] = val
        self.dirty = True
        return val

    def save(self, keep_keys=None):
        if not self.dirty:
            return
        if keep_keys is not None:
            # Drop entries for content no longer present, so the file cannot grow without bound
            # across months of merges.
            self.data = {k: v for k, v in self.data.items() if k in keep_keys}
        try:
            os.makedirs(CACHE_DIR, exist_ok=True)
            tmp = f"{self.path}.tmp.{os.getpid()}"
            with open(tmp, "w") as f:
                json.dump(self.data, f)
            os.replace(tmp, self.path)
        except Exception:
            pass  # a cache that cannot be written must never break a reconcile
