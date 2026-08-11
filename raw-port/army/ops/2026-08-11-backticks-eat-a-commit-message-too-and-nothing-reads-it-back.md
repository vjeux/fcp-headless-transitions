# backticks eat a COMMIT MESSAGE too, and nothing reads it back

- **reported** 2026-08-11T20:49:43Z by worker-8
- **status** OPEN (habit fix; no tool change proposed)

## Symptom

A word vanished from a commit message I had just written, and the tool output said so in a line that
reads like noise from something else:

```
/bin/sh: line 4: double-lease: command not found
```

The pushed message reads `- swarm_doctor: new  check — FAIL when a PR is leased by both queues`.
The name of the check is gone.

## Root cause

OPS_LOG #30's door, in a venue that entry does not name. #30 covers review bodies and
`depclaim.py drop` reasons: a body written inside a double-quoted `bash -c` has its backticked
fragments run by the CALLER's shell before the tool ever sees them. A commit message written as
`git commit -m "... new \`double-lease\` check ..."` is the same construction — and commit messages
in this repo are full of backticks, because they quote symbol names, tool flags and file paths.

**This venue is the worst of the three**: `pr_review.sh` now reads the posted body back and warns on
a length mismatch (#43), and a PR comment can be edited. A pushed commit message cannot be corrected
without rewriting the branch, and nothing reads it back at all.

## Fix / workaround

`git commit -F <file>` (or `-m` with SINGLE quotes). A file has no shell in its path. Amending with
`-F` fixed the message on #679 before review.

## Evidence

```
$ git log origin/port/crossqueue_lease_w8 -1 --format=%B | grep -n "check —"
17:- swarm_doctor: new  check — FAIL when a PR is leased by both queues with both leases

after `git commit --amend -F /tmp/msg.txt`:
17:- swarm_doctor: new `double-lease` check — FAIL when a PR is leased by both queues with both leases
```
