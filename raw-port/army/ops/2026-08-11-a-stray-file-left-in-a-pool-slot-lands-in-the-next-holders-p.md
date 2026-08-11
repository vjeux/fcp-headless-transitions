# a stray file left in a pool slot lands in the next holder's PR

- **reported** 2026-08-11T23:19:47Z by worker-2
- **status** FIXED in this change (`wt_pool.sh` cleans the whole tree, archiving first;
  `test_wt_pool_clean.sh` pins both halves)

## Symptom

Reworking PR #600 I merged `origin/main` into the branch, ran `git add -A`, committed, and then —
per the standing rule — read the three-dot file list before pushing:

```
$ git diff --name-status origin/main...HEAD
A       raw-port/army/ops/2026-08-11-twenty-concurrent-prove-all-runs-peg-the-box-at-load-168-and.md
M       raw-port/army/tools/pr_gate.sh
M       raw-port/army/tools/rework_claim.sh
A       raw-port/army/tools/stale_file_check.py
...
```

That first file is not mine and has nothing to do with #600. It was **worker 5's**, written in this
same pool slot during their shift, left untracked when the shift ended, and still sitting on disk
when `wt_pool.sh acquire-at` handed me the slot. My `add -A` published it inside a PR about a gate
guard, under a commit message about something else entirely.

## Root cause

`reset_clean()` in `wt_pool.sh` was

```sh
git -C "$wt" reset -q --hard origin/main
git -C "$wt" clean -fdq -- raw-port/src raw-port/re     # <- two directories out of the whole repo
```

`reset --hard` does not remove untracked files, and the clean that is supposed to be its other half
only looked at `raw-port/src` and `raw-port/re`. Anything untracked anywhere else — an `ops/` entry,
a half-written tool, a scratch script — survived the release and was handed to the next holder.

**Nothing downstream can catch it.** The stray arrives as an ADD, so every `--diff-filter=D` guard
in the repo is silent by construction; `gate.sh` only inspects the `.ts` files it is handed;
`stale_file_check.py` measures deletions; `regression_check`/`dup_check` are about `raw-port/src`.
The only thing that saw it was reading the three-dot file list by hand — the same rule that caught
the near-miss recorded in OPS_LOG's "`git reset --hard origin/main` DOES NOT REMOVE UNTRACKED FILES"
passage. That passage ends with "which is exactly why `reset_clean` in `wt_pool.sh` runs both", and
that sentence was true for two directories out of the repo.

Two things made it likely rather than exotic: `army/ops/` is where every agent is now told to write
its findings (one file per entry), and an agent that dies or is cut off mid-entry leaves exactly
this shape behind.

## Fix / workaround

**Fixed here.** `reset_clean` now cleans the whole worktree — and, because widening a delete is the
dangerous direction, it **archives first**:

```sh
strays="$(git -C "$wt" clean -nd | sed 's/^Would remove //')"
[ -n "$strays" ] && tar -cf "$POOL/rescue/strays-<slot>-<ts>.tar" -T -   # from inside $wt
git -C "$wt" clean -fdq        # no -x
```

Two properties, and the test asserts both, because they are opposite failures:

* **not too narrow** — an untracked file under `army/ops/` or `army/tools/` does not survive a
  release (the incident);
* **not too wide** — **no `-x`**. Gitignored state is the warm cache the pool exists to keep:
  `node_modules`/`venv` (symlinks into the canonical checkout), `raw-port/.gate.tsbuildinfo` (the
  tsgo cache, typecheck 1.2s → 0.2s) and `army/inventory/*.syms.txt` (whose absence sends agents
  back to a 78 MB `nm`). `clean -fd` removes untracked-but-not-ignored files only, so all of those
  stay. A `-x` here would look like a tidier fix and would degrade every gate on the box invisibly.

The archive step is not decoration. The stale-slot RESCUE path a few lines above does
`git add -N -- raw-port/src raw-port/re` — **also scoped** — so it captures nothing outside those
two directories. Without the tar, a wider clean would DELETE a dead peer's untracked ops entry where
the narrow one at least left it on disk: the fix becoming the next outage, which is standing rule 8
in this log. With it, the slot ends pristine and the bytes are still on disk under
`~/.fct-pool/rescue/`.

**Until it lands**, and worth keeping afterwards: after any push, read
`git diff --name-status origin/main...HEAD` and confirm every path is one you meant. That is the
only thing that caught this one.

**Not fixed here, and someone should:** the rescue path's `add -N` is still scoped to `src`/`re`, so
a *reclaimed* slot's rescue patch still omits untracked work elsewhere. The tar above covers the
release path; widening the `add -N` to `-A` would cover the reclaim path too.

## Evidence

```
# the pool tool, before this change
$ grep -n 'clean -fdq' raw-port/army/tools/wt_pool.sh
216:  git -C "$wt" clean -fdq -- raw-port/src raw-port/re 2>/dev/null || true

# the slot I was handed, after `wt_pool.sh acquire-at <sha>` reset it
$ git status --porcelain | grep ops/
?? raw-port/army/ops/2026-08-11-twenty-concurrent-prove-all-runs-peg-the-box-at-load-168-and.md

# and after `git add -A && commit`, in a PR about a gate guard
$ git diff --name-status origin/main...HEAD | head -1
A       raw-port/army/ops/2026-08-11-twenty-concurrent-prove-all-runs-peg-the-box-at-load-168-and.md
```

The recovery: rebuild the branch without it (`git rm --cached`, re-commit), and land the entry as
its own PR — it was a real finding and is now #735.

Test at this head:

```
$ bash raw-port/army/tools/test_wt_pool_clean.sh
  ok   — an untracked file OUTSIDE src/re does not survive a release
  ok   — ...nor an untracked tool
  ok   — what the clean removes is archived first, so a dead peer's work is not destroyed
  ok   — gitignored node_modules survives (no -x)
  ok   — the gitignored tsgo cache survives (no -x)
  ok   — the gitignored symbol inventory survives (no -x)
  ok   — a tracked modification is still reset to origin/main
  ok   — an untracked src file is still cleaned, and archived with the rest
BASELINE (M0): 8 passed, 0 failed
  mutant narrow_scope killed (restoring the src/re-only pathspec lets the stray survive)
TEST_WT_POOL_CLEAN: PASS (8 cases, 1 mutant killed)
```

The suite runs against a throwaway `$HOME` — `wt_pool` derives both its pool and the canonical
checkout from it — so it touches no live slot, no lease, and nothing under the real `~/.fct-pool`.
It is wired into `prove_all.py` as a layer, so it is not another guard with no caller.
