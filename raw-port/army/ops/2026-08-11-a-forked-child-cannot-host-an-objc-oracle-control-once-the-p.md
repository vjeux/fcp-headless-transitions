# a forked child cannot host an ObjC oracle control once the parent has loaded a framework

- **reported** 2026-08-11T23:19:50Z by worker-5
- **status** OPEN (worked around in `raw-port/re/oracle/OZ3DEngineSceneFileImpl_postReadMedia_oracle.py`;
  the workaround is three lines and belongs in the recipe rather than in one harness)

## Symptom

Oracling `OZ3DEngineSceneFileImpl::postReadMedia()` @Ozone 0x3c0950 (PR #744), whose whole body is
`movb $0x1,%al ; retq`. This log's recipe for a constant-returning body is to prove the INSTRUMENT
before believing the answer, and its strongest form is *"call a REAL OVERRIDE of the same virtual,
through the IDENTICAL `CFUNCTYPE`, with the IDENTICAL argument tuples"*. Here that override is
`OZ3DEngineSceneFileImplUSDZ::postReadMedia()` @0x3c0870, which returns 0 on its nil path — a
different answer out of the same vtable slot, which is exactly what makes the control worth having.

It also sends ObjC messages and allocates an `MDLAsset`, so I ran it in a **forked child** to
contain a possible crash. The child never got as far as the call:

```
objc[7113]: +[NSUnitLength initialize] may have been in progress in another thread when fork() was
called. We cannot safely call it or ignore it in the fork() child process. Crashing instead.
   INCONCLUSIVE: the child exited with status 6
```

The run then reported `DIVERGED/INCONCLUSIVE: 1 check(s) failed` — correctly, but for a reason that
has nothing to do with the port under test.

## Root cause

Not a bug in the swarm's tools; a property of macOS that this recipe walks straight into. By the
time the harness reaches its controls it has already `dlopen`ed the framework and 43 of its
dependencies, which initialises the ObjC runtime and starts its threads. `fork()` gives the child
one thread and an arbitrary snapshot of every lock, so the first `+initialize` in the child hits
`objc_initializeAfterForkError` and `abort()`s. Only `fork()` + `exec()` is safe.

Note the shape, because it is the interesting half: **the containment measure destroyed the control
it was there to protect**, and it did so in a way that reads as "the control is unavailable on this
box" rather than as "the harness is wrong". Answering a dead control by deleting it — the tempting
next move — would have removed the only evidence that the instrument can see a value other than the
constant under test.

## Fix / workaround

Re-execute the ORACLE ITSELF as a subprocess with a flag, instead of forking:

```python
if "--usdz-control" in sys.argv:          # child mode, at the bottom of the loader
    buf = (ctypes.c_ubyte * ARENA)()
    print("USDZ_CONTROL=%d" % BoolFn(slide + VA_USDZ)(ctypes.byref(buf)))
    sys.exit(0)
...
child = subprocess.run(["arch", "-x86_64", "/usr/bin/python3", os.path.abspath(__file__),
                        "--usdz-control"], capture_output=True, text=True, timeout=300)
```

Three things this must get right, all of them easy to miss:

* **`arch -x86_64` again.** `sys.executable` under `arch -x86_64 /usr/bin/python3` is still
  `/usr/bin/python3`, so a plain `[sys.executable, __file__]` relaunches the child NATIVELY — the
  slice trap, re-entering through the door marked "child process". Name the arch explicitly.
* **A crash must stay reportable.** Check `returncode` and parse a tagged line
  (`USDZ_CONTROL=<n>`); if either is missing, print INCONCLUSIVE for that control and let it count
  against the verdict. An unavailable control is a fact about the run, not a line to skip.
* **`timeout=`.** The child loads the framework chain itself (~3s here, 44 images); a control that
  hangs must not become a hung slot.

Generalising, for the recipe rather than for this harness: **any oracle control that touches ObjC —
which is most of Ozone and all of the `MDL*`/`NS*` paths — needs a re-exec'd subprocess, not a
fork.** The cost is one extra framework load per control (measured ~3s), which is cheap next to
the alternative of signing a constant-returning port on an instrument nobody proved.

## Two smaller ones from the same run

* **ASSERT ONLY THE BYTES YOU READ.** The first draft of the same harness asserted 11 opcode bytes
  and typed the trailing `nopl` padding out of the otool listing: `0f 1f 44 …`, the 5-byte form.
  The live image has the 8-byte form `0f 1f 84 00 00 00 00 00`, so the identity check refused a
  correct port and exited 2. The check did its job and the mistake was mine, but the general form is
  worth the line: an opcode assertion is only as good as its provenance, and padding is precisely
  where a listing invites you to guess. Read the bytes out of `/tmp/<FW>.x86_64` at the function's
  vmaddr, assert the FUNCTION separately from the PADDING, and label the padding not-executed.
* **`rebase_pr` hit the "branch a peer holds" collision again, and the attempt was charged again.**
  Second measured instance of the entry
  [`…-rebase-pr-cannot-check-out-a-branch-a-peer-holds-and-the-att.md`](2026-08-11-rebase-pr-cannot-check-out-a-branch-a-peer-holds-and-the-att.md),
  this time on PR #714 (`tools/publish-guard`): `rebase_claim` handed it over at attempt 2/3,
  `rebase_pr` printed `cannot check out tools/publish-guard`, and `~/.fct-pool/wt/6` was holding
  that branch with a peer's staged work, leased 8 minutes earlier. I followed the recorded remedy —
  did not push over it, released the lease, rolled the counter back (to 1, not deleted: attempt 1
  was somebody's real attempt) and moved on. Two instances is what turns that entry's third
  suggested fix — have `rebase_claim` skip a PR whose branch is currently checked out in a pool
  worktree, `git worktree list --porcelain | grep -F "branch refs/heads/<br>"`, one cheap local
  call — into the obvious thing to do.

## Evidence

```
$ arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZ3DEngineSceneFileImpl_postReadMedia_oracle.py
# with the fork() version:
objc[7113]: +[NSUnitLength initialize] may have been in progress in another thread when fork() was
  called. ... Crashing instead.
D. CONTROL 2 — ... in a forked child
   INCONCLUSIVE: the child exited with status 6
DIVERGED/INCONCLUSIVE: 1 check(s) failed          # exit 1

# with the re-exec'd subprocess:
D. CONTROL 2 — the REAL override of this same virtual,
   OZ3DEngineSceneFileImplUSDZ::postReadMedia() @0x3c0870, in a separate process
   the override returned 0 on a zeroed arena — the instrument can see a DIFFERENT answer from this
   very virtual
VERIFIED: live Ozone returns 1 on every arena and the port returns true; the arena is untouched;
both controls produced other values (planted 0/1/7/255/42, override 0); the mutant dies on every
case.                                              # exit 0
```

```
# the padding mistake, and the check catching it
   bytes @0x3c0950  554889e5b0015dc30f1f84 MISMATCH
   expected         554889e5b0015dc30f1f44
$ python3 -c "print(open('/tmp/Ozone.x86_64','rb').read()[0x3c0950:0x3c0960].hex())"
554889e5b0015dc30f1f840000000000
```

```
# the second rebase collision
$ bash raw-port/army/tools/rebase_claim.sh claim
CLAIMED 714 tools/publish-guard   (conflicts with main; attempt 2/3 on head e9260f9e)
$ bash raw-port/army/tools/rebase_pr.sh 714
wt_pool: leased slot 7 -> /Users/vjeux/.fct-pool/wt/7 (port/tools_publish-guard, base main)
rebase_pr: cannot check out tools/publish-guard
$ git -C ~/.fct-pool/wt/6 symbolic-ref --short HEAD ; git -C ~/.fct-pool/wt/6 status --porcelain | head -1
tools/publish-guard
A  raw-port/army/ops/2026-08-11-a-fixture-that-omits-a-field-the-selector-newly-reads-goes-g.md
$ cat ~/.fct-pool/leases/6/holder
port/tools_publish-guard 1786488346        # leased 8 minutes before the queue offered me the PR
```
