# a branch ref that differs only in case is ONE file, and the push then refuses

- **reported** 2026-08-11 by worker 2
- **status** OPEN (workaround below is reliable; no tool change made)

## Symptom

`pr_submit.sh` could not push a branch the worktree was demonstrably ON, and said so in a way that
reads like a bug in git:

    $ git -C ~/.fct-pool/wt/11 rev-parse --abbrev-ref HEAD
    port/opslog_w3
    $ bash raw-port/army/tools/pr_submit.sh opslog_w3
    fatal: port/opslog_w3 cannot be resolved to branch
    PR already open: #646

Every obvious check said the branch was fine — `git symbolic-ref HEAD` printed
`refs/heads/port/opslog_w3`, `git rev-parse --verify refs/heads/port/opslog_w3` printed a SHA, and
`git worktree list` showed the slot on `[port/opslog_w3]`. But `git branch --list 'port/ops*'` did
not list it, and that is the tell.

Two other things happened in the same minutes and are the same cause: `git rev-parse --verify -q
origin/port/opslog_w3` came back empty right after `pr_submit` ran (its `git remote prune origin`
is not what removed it — see below), so `--force-with-lease` had no lease ref to compare against;
and a plain `git push -u origin <branch>` failed identically on every retry, which is what rules
out the transient-TLS explanation this box also produces.

## Root cause

**Loose refs are FILES, and this volume is case-insensitive.** `refs/heads/port/OPSLOG_w3` already
existed (the same agent had used that spelling earlier in the session), so
`git checkout -B port/opslog_w3 origin/main` wrote into THAT file. The ref store therefore holds one
ref whose canonical name is `port/OPSLOG_w3`:

* `git rev-parse refs/heads/port/opslog_w3` SUCCEEDS — the filesystem resolves the path
  case-insensitively;
* `git for-each-ref` / `git branch --list` report only `port/OPSLOG_w3` — iteration reads the real
  directory entries;
* `git push -u origin port/opslog_w3` FAILS — the push path resolves the name through the ref store's
  iteration, finds no branch of that exact name, and dies with
  `fatal: <name> cannot be resolved to branch`.

So the failure is not random: it fires for any branch whose name differs only in case from one that
already exists locally, and this repo has plenty (`port/OPSLOG_w3` vs `port/opslog_w3`,
`port/OPSLOG_rev1` vs `port/opslog_rev1`, `port/OpsLogWorker4`, …). `wt_pool.sh acquire <Class>`
runs `checkout -B port/<Class>`, so it can silently HIJACK a peer's ref the same way — the reflog is
the only trace. In my case the clobbered ref's reflog was entirely the same agent's own commits
(checked before pushing), so nothing was lost, but that was luck rather than design.

This is the sibling of the source-file hazard `AGENT_ENTRY` §5 already warns about (`HgcFoo.ts`
silently overwriting a landed `HGCFoo.ts`), one level down, and nothing warns about this one.

## Fix / workaround

Push an explicit refspec with an explicit lease value — both halves are needed, because the lease
ref lookup fails for the same reason the branch lookup does:

    git_push_as.sh worker origin HEAD:refs/heads/<branch> \
        --force-with-lease=refs/heads/<branch>:<the sha you fetched>

Before assuming your ref is the one you think it is:

    git for-each-ref refs/heads | grep -i <name>     # -i, and read the SPELLING it prints back

If the spelling differs from yours, you are sharing a ref with another branch. Check
`git reflog show <that ref>` before pushing anything: if it contains commits that are not yours, you
have taken over a peer's branch name and the push would publish over their work.

Tool fixes worth making, in order of value: (a) `wt_pool.sh acquire` should compare the requested
branch against `git for-each-ref` case-insensitively and refuse (or use the existing spelling)
rather than silently writing into the other ref; (b) `pr_submit.sh` should push
`HEAD:refs/heads/$BR` with an explicit lease, which is immune to this and no worse in any other
case; (c) `swarm_doctor` could list case-colliding refs — it is one `for-each-ref` and a
`sort -f | uniq -Di`.

## Evidence

```
$ git -C ~/.fct-pool/wt/11 for-each-ref | grep -i opslog_w3
9d47a70a66c7017554ff42145667025f1b54d9a5 commit refs/heads/port/OPSLOG_w3      <- MY commit
8f795a689def6b6c145db1daa93192dd0a290dde commit refs/heads/port/opslog_w3_float
8e1a62212b5aa762b96ff2fd06ca1634a1733194 commit refs/heads/port/opslog_w3_lease
74a8934bd75308ec280097d1b19dc9530f11618f commit refs/remotes/origin/port/opslog_w3

$ git -C ~/.fct-pool/wt/11 rev-parse --verify refs/heads/port/opslog_w3
9d47a70a66c7017554ff42145667025f1b54d9a5                     # resolves…
$ git -C ~/.fct-pool/wt/11 branch --list 'port/opslog_w3'
                                                             # …but does not exist
$ ls -l $(git rev-parse --git-common-dir)/refs/heads/port/ | grep -i opslog_w3
-rw-r--r--  1 vjeux  staff  41 Aug 11 13:15 OPSLOG_w3        # one file, my mtime

$ bash raw-port/army/tools/ghapp/git_push_as.sh worker -u origin port/opslog_w3 --force-with-lease
fatal: port/opslog_w3 cannot be resolved to branch

$ bash raw-port/army/tools/ghapp/git_push_as.sh worker origin HEAD:refs/heads/port/opslog_w3 \
      --force-with-lease=refs/heads/port/opslog_w3:74a8934bd75308ec280097d1b19dc9530f11618f
To https://github.com/vjeux/fcp-headless-transitions.git
 + 74a8934b...9d47a70a HEAD -> port/opslog_w3 (forced update)
```

A second, smaller instance of the same hazard, worth repeating because it nearly inverted a
measurement: while measuring the SOURCE-file version of this (does G6 catch an APFS overwrite?), I
wrote the two gate logs to `/tmp/..._hgc.txt` and `/tmp/..._HGC.txt`. Those are one file. The second
run silently overwrote the first and I read a REJECT that belonged to the other spelling. **If you
are measuring a case collision, spell your scratch files with different WORDS, not different cases.**
