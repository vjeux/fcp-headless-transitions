# an exported agent id does not survive a fresh-shell harness

- **reported** 2026-08-11 by worker 4
- **status** OPEN (documented in `AGENT_ENTRY.md` by this change; the tool-side fix is still open)

## Symptom

A PR filed with no author marker, and the only sign was three lines inside an otherwise successful
submit:

```
https://github.com/vjeux/fcp-headless-transitions/pull/654
pr_submit: FCT_AGENT_ID unset — not recording who authored PR #654, so a reviewer slot
           cannot skip its own PR. (run: export FCT_AGENT_ID=worker-<N>)
```

I had run `export FCT_AGENT_ID=worker-4` — several commands earlier, exactly as AGENT_ENTRY §2.3
says to. The variable was gone by the time `pr_submit.sh` ran.

## Root cause

Not the tool. **This harness starts a new shell for every command** (each tool call is its own
`sh -c "…"`), so an `export` in one command cannot reach the next; the process it belonged to
exited. AGENT_ENTRY's instruction — "take the slot lock, then export the id it prints" — reads as a
once-per-session step, which is true of a human at a terminal and false of every tool-call harness.

The failure is quiet by construction, and both halves of that are working as intended:
`pr_submit.sh` deliberately **fails open** (a marker that cannot match is worse than none, so with
no id it writes nothing and says why), and the message it prints is on stderr in the middle of a
submit that otherwise succeeded and ends with a PR URL. Nothing downstream fails, so nothing ever
reminds you. The cost lands later and on someone else: `review_claim.sh` cannot skip a PR whose
author it does not know, so a reviewer slot can be leased its own work — the thing the marker
exists to prevent.

## Fix / workaround

**For agents, today:** put the assignment in the SAME command as anything that reads it —

```
export FCT_AGENT_ID=worker-4 && bash raw-port/army/tools/pr_submit.sh <Class>
```

and repair a PR already filed without it (the file IS the marker; writing it afterwards is
equivalent):

```
echo worker-4 > "${FCT_STATE_DIR:-$HOME/.fct-pool}"/authored/654
```

**Documented** in AGENT_ENTRY §2.3 by this change, which is where the misleading instruction is.

**Still open, tool-side.** The id could be recovered instead of remembered: `pr_submit.sh` always
runs inside a leased pool worktree, and the lease knows who took it, so the marker could be read
from the lease when the variable is absent. I have not built that here because `wt_pool.sh`'s
claim-time-`FCT_AGENT_ID` change is in flight on another branch (#649) and two edits to that file
would collide. Whoever lands #649: this is a small addition on top of it, and it removes the class
of error rather than documenting it. A second, cheaper option is for `pr_submit.sh` to print the
warning **again at the end**, after the PR URL, so it is the last thing on screen rather than the
middle.

## Evidence

The harness, demonstrated directly — two consecutive commands in this session:

```
$ export FCT_AGENT_ID=worker-4; echo "same command: [$FCT_AGENT_ID]"
same command: [worker-4]
$ echo "next command: [${FCT_AGENT_ID:-<unset>}]"
next command: [<unset>]
```

The consequence, from the live submit of #654 (quoted above), and the repair, which is what the PR
carries now:

```
$ cat ~/.fct-pool/authored/654
worker-4
```

Three of my PRs this shift needed that repair by hand (#654, #663, #675) before I moved the
assignment into every command.
