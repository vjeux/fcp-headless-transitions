# twenty concurrent prove_all runs peg the box at load 168 and none of them finish

- **reported** 2026-08-11T21:30:48Z by worker-5
- **status** OPEN (fix proposed below; this entry ships the detection, not the cure)

## Symptom

A `gate.sh` run that takes ~20 seconds took **51 minutes and never returned**; the shell that
launched it was still alive two hours later at 0.0% CPU. Nothing was wrong with the gate. The box
was at **load average 168** with **eight concurrent whole-repo `prove_all.py` runs**, every one of
them at **0.0% CPU** — all started within the preceding 5m22s, none making progress, none finishing.

This is not the same failure as OPS_LOG #23 (`mark_ported.py` run N times concurrently). That entry
is about wasted work; this one is about a **livelock**: eight processes each waiting on file I/O
behind the MDM security stack, each slowing the other seven, so the wall-clock cost of the set is
worse than running them one at a time by a wide margin, and unrelated work on the box (a gate, an
oracle, a `git fetch`) stops dead.

## Root cause

`AGENT_ENTRY.md` §1 tells **every reviewer** to run `python3 raw-port/army/verifier/prove_all.py`
**once at start**, and that is the only instruction about it. `prove_all.py` is a whole-repo verifier
— it reconciles the entire tree, exactly the shape of tool AGENT_ENTRY §4's own rule already covers:

> **Before a global maintenance tool, check for a peer already running it.** `mark_ported.py`,
> `build_ledger.py` and `depgraph.py` reconcile the WHOLE repo and are idempotent: one run covers
> every agent's commit. `pgrep -f mark_ported` and skip if one is live (OPS_LOG #23).

`prove_all.py` **is not in that list**, has no lock of its own, and is invoked at exactly the moment
that guarantees a pile-up: agent startup. With N reviewer slots — and with the harness restarting
dead slots, so restarts cluster — N copies run at once by construction. The rule to prevent this has
existed all day; the tool it needed to name was missing from it.

Worth noting for whoever fixes it: the runs are also **redundant**, not merely simultaneous.
`prove_all` verifies the state of a tree, so eight runs at the same `origin/main` SHA are eight
computations of one answer.

## Fix / workaround

**Now, for an agent:** before running `prove_all.py`, `pgrep -f prove_all.py`. If one is live, wait
for it rather than starting a ninth — and if the box is already loaded, remember that *your*
`gate.sh` timing out is a symptom of this and not of your change.

**Proposed, in order:**
1. Add `prove_all.py` to AGENT_ENTRY §4's list by name, and to §1 where reviewers are told to run it
   — the rule is right, it just does not name this tool.
2. Give `prove_all.py` a single-flight lock keyed on the `origin/main` SHA it is verifying: an atomic
   `mkdir` lock, and on contention **wait for the holder and reuse its recorded verdict for the same
   SHA** rather than exiting. Exiting would be worse than the pile-up — a reviewer that skips
   `prove_all` starts unverified — so the fix must end with the caller holding a real PASS.
   Sequencing eight identical runs also finishes the set sooner than racing them.
3. Consider whether `swarm_maint.sh` (a script, not an agent) should own the periodic run outright,
   with reviewers reading the recorded result. Whole-repo reconciliation is already its job.

**Landed with this entry:** a `swarm_doctor.py` check, `verifier-contention`, that counts live
whole-repo verifier processes and FAILs above one, so the condition is visible from the tool
AGENT_ENTRY §7b already tells agents to run when the swarm looks wrong. Detection only — it changes
no behaviour and takes no lock.

## Evidence

```
$ uptime
14:29  up 2 days,  3:24, 2 users, load averages: 168.98 195.33 194.83

$ pgrep -f "prove_all.py" | wc -l
      20                      # 8 distinct runs; each has a shell + `timeout` wrapper

$ ps -o pid,etime,%cpu,command -p <those pids>
  PID ELAPSED  %CPU COMMAND
 8429   05:22   0.0 /bin/sh -c cd ~/random/final-cut-pro-transitions && python3 raw-port/army/verifier/prove_all.py ...
 9320   05:10   0.0 /bin/sh -c cd /Users/vjeux/.fct-pool/wt/7 && ... timeout 1500 python3 raw-port/army/verifier/prove_all.py ...
11423   04:36   0.0 /bin/sh -c cd ~/random/final-cut-pro-transitions && python3 raw-port/army/verifier/prove_all.py ...
12317   04:24   0.0 /bin/sh -c ... git fetch -q origin main ...; python3 raw-port/army/verifier/prove_all.py ...
16252   03:28   0.0 /bin/sh -c cd /Users/vjeux/.fct-pool/wt/6 && timeout 1200 python3 raw-port/army/verifier/prove_all.py ...
21084   01:43   0.0 /bin/sh -c WT=/Users/vjeux/.fct-pool/wt/11; ... time python3 raw-port/army/verifier/prove_all.py ...
22894   01:20   0.0 /bin/sh -c cd /Users/vjeux/.fct-pool/wt/4 && timeout 1800 python3 raw-port/army/verifier/prove_all.py ...
23488   01:07   0.0 /bin/sh -c WT=$(cat /tmp/w6_wt.txt); ... timeout 900 python3 raw-port/army/verifier/prove_all.py ...
```

Eight runs, the oldest 5m22s old, **every one of them at 0.0% CPU**. Two of them carry `timeout 900`
/ `timeout 1200`, i.e. their authors already expect this to run long enough to need a bound.

What it cost me, measured on the same box at the same time: one `gate.sh` invocation on a single
`.ts` file — normally ~20s — ran for **51 minutes without returning**, and a differential oracle that
takes ~8s ran for **60 minutes without returning**. Both completed normally later. Neither had
anything wrong with it.
