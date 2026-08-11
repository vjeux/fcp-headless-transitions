# the union rebase could not find the branch it had just pushed

- **reported** 2026-08-11T20:40:00Z by worker-1
- **status** FIXED in this change

## Symptom

`rebase_pr.sh` refused to publish a rebase it had already computed, and said the rebase was
*missing files* — about a branch that was complete, gate-green and sitting on the remote. Hit on
PR #660 (`port/OZChannelBase__slot3`), the first rebase task of the shift:

    rebase_pr: PR #660  branch=port/OZChannelBase__slot3  class=OZChannelBase__slot3
    fatal: ambiguous argument 'origin/main...origin/port/OZChannelBase__slot3_rebased': unknown revision
    rebase_pr: REFUSING to force-push — the rebased branch is missing files the PR has:
        raw-port/re/oracle/OZChannelBase_testDefaultFlag_driver.mts
        raw-port/re/oracle/OZChannelBase_testDefaultFlag_oracle.py
        raw-port/src/channels/OZChannelBase.ts
    REBASE_MANUAL

Every one of those three files was present in the union. The PR then goes back to the queue with
its content unchanged, so the next worker sees the identical failure — and at 3/3 attempts the
rebase queue CLOSES the PR (#28's shape, now aimed at work that was already finished).

## Root cause

Two tools derive one branch name, differently, and only one of them pushed it.

* `rebase_helper.py` resolves the CLASS from the PR and strips **both** suffixes
  (`rebase_helper.py:134`, `re.sub(r'(__slot\d+|_rebased)$', '', cls)`), then pushes
  `port/<Class>_rebased` (`:300`).
* `rebase_pr.sh` re-derived the same name from the **branch**, stripping only `_rebased`
  (`CLS="${BR#port/}"; CLS="${CLS%_rebased}"`), and looked for `port/<Class>__slot<N>_rebased`.

That ref does not exist, so `git diff origin/main...origin/<missing>` fataled and printed nothing;
the empty side made `comm -23` report **every** file as missing; and the last-guard-before-a-
force-push — a good guard, added by #25/#449 to stop a rebase dropping a branch's oracle harness —
fired on a fabricated file list.

It is invisible on `port/<Class>` PRs, where the two spellings coincide. `port/<Class>__slot<N>` is
the shape #240 cuts whenever a class is worked in two slots at once, i.e. the normal shape under
contention, and it is the only shape that breaks.

Note the failure direction: a MISSING REF and a DROPPED FILE printed the same sentence, so the tool
could not tell a fault in itself from a fault in its input, and neither could the worker reading it.

## Fix / workaround

In this change (`rebase_pr.sh`):

1. **Take the name from the tool that pushed it** — parse rebase_helper's own
   `PUSHED origin/<branch>` line out of the log this script already captures, and fall back to the
   class-stripped spelling only if that line is absent. One derivation, by the only party that
   knows.
2. **A missing ref is reported as a tooling fault, not as missing files**, and refuses the push
   with its own message. The file-list guard now runs only when both sides of the comparison exist,
   which is the only state in which its answer means anything.
3. `swarm_doctor.py` gains `check_rebase_branch_naming`: the GUARD half reads `rebase_pr.sh` from
   `origin/main` and asks whether it still composes the name out of `$CLS`, and the LIVE half lists
   `port/*_rebased` refs on the remote — the success path deletes that temp ref, so a lingering one
   is a completed rebase that never landed.
4. `verifier/test_rebase_tools.py` case 4 runs the REAL `rebase_pr.sh` end to end against a scratch
   `$HOME` on a `port/C__slot7` PR, stubbing only `gh` and the gate.

WORKAROUND on an older copy, and what recovered #660: the union is already on the remote under
`port/<Class>_rebased`. Verify it (three-dot file list equals the PR's, `regression_check.py`
clean, `gate.sh` PASS in a leased worktree at that SHA), then
`git push -f origin refs/remotes/origin/port/<Class>_rebased:refs/heads/<PR branch>` and delete the
temp ref. Do not re-run the rebase; it already succeeded.

## Evidence

Case 4 against `origin/main`'s `rebase_pr.sh`, verbatim — the incident reproduced on a scratch repo:

```
test_rebase_tools: FAIL
    4. rebase_pr.sh did not land the union on a `__slot<N>` PR branch (rc=6): the PR has:
       raw-port/re/oracle/C_oracle.py raw-port/src/x/C.ts
    REBASE_MANUAL
    fatal: ambiguous argument 'origin/main...origin/port/C__slot7_rebased': unknown revision
```

The same case with this change applied: `test_rebase_tools: PASS` (43s), and mutation-tested — put
main's `RB="port/${CLS}_rebased"` back, leaving valid code, and case 4 names the refusal again.

The doctor's live half, run before this landed — five completed unions on the remote that were
pushed and never repointed, one of them (`port/OZChannel_rebased`) belonging to open PR #659, then
sitting at attempt 1/3:

```
FAIL | rebase-branch-naming | rebase_pr.sh re-derives the rebased branch name instead of taking it
from rebase_helper's output ... ORPHAN union branches on the remote right now: port/HGRasterizer_rebased,
port/OZChannel_rebased, port/OZRenderParams_dw06_getDestDevice_rebased,
port/OZRenderParams_setDo3DIntersectionAntialiasing_rebased, port/OZSceneSettings_rebased
```

PR #660 itself, recovered by hand with the workaround above: gate PASS on the union head
(`G6 add-only: +7 addr, +1 decl`), `regression_check` clean, force-pushed onto
`port/OZChannelBase__slot3`, and GitHub then reported the PR `MERGEABLE`.
