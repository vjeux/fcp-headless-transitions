# a reviewer's measurement lease is a DISPOSABLE gate lease, reclaimable after 15 minutes

- **reported** 2026-08-11T22:41:00Z by reviewer-1
- **status** OPEN (workaround available today; two tool fixes proposed, neither done)

## Symptom

`wt_pool.sh acquire-at <SHA>` — the command `REVIEWER_BRIEF` and `HARNESS_LOOP` tell every reviewer
to use, and the one a reviewer holds while re-deriving disassembly and running a live differential —
stamps its lease with the tag **`gate/<sha>`**. That is the same tag `pr_gate.sh` uses for a
throwaway lease that lives about a minute. Observed four times in one session, on four different
slots:

```
wt_pool: leased slot 3 -> /Users/vjeux/.fct-pool/wt/3 (gate/4b257bf96240)
wt_pool: leased slot 1 -> /Users/vjeux/.fct-pool/wt/1 (gate/0646712fbd98)
wt_pool: leased slot 1 -> /Users/vjeux/.fct-pool/wt/1 (gate/7d538e85959e)
wt_pool: leased slot 5 -> /Users/vjeux/.fct-pool/wt/5 (gate/2a0df0e26e4d)
```

The pool's reclaim treats a `gate/*` lease as disposable, so **a reviewer's tree can be reset out
from under a running measurement after 15 minutes** — not the 120 minutes `WT_POOL_STALE` suggests,
and not the "your lease is yours" a reviewer would reasonably assume.

## Root cause

`claim_slot`'s FAST PATH, added by #258 to stop `pr_gate` leaks from exhausting the pool
(`wt_pool.sh:114-125` on origin/main):

```sh
local gate_stale="${GATE_STALE_MIN:-15}"
...
case "$(cat "$lk/holder" 2>/dev/null)" in
  gate/*)
    if [ -n "$(find "$lk/holder" -mmin +$gate_stale 2>/dev/null)" ]; then
      stamp/echo "$tag" > "$lk/holder"; log "wt_pool: reclaimed abandoned gate slot $i"
```

Two facts make this bite a reviewer specifically:

1. **`acquire-at` and `pr_gate` are indistinguishable to the reclaim.** The tag encodes what the
   lease is FOR (a head SHA), and both spell it `gate/`. A one-minute gate run and a forty-minute
   adversarial review are the same object.
2. **`$lk/holder`'s mtime is written once, at claim time, and never refreshed.** Worktree leases
   have no heartbeat — `slot_lock.sh` grew one in #32 for exactly this reason, and the pool did not.
   So the age the reclaim measures is "time since you leased", not "time since you did anything",
   and a lease cannot be kept alive by working.

The 15-minute window is shorter than the work the brief prescribes. Re-deriving a disasm, running a
differential against the live binary, and reading a 200-instruction body against the TS is routinely
longer than that; a 226-instruction AVX kernel with a real corpus is much longer.

**Direction of failure.** Reviewer-9's entry (`...a-reviewer-worktree-is-reset-mid-differential...`)
established what happens when the tree is taken mid-measurement, and it is the bad direction: for a
port that EXTENDS a landed class file, the reset leaves `origin/main`'s copy of that same path in
place, so the driver imports a file that exists, compiles, and agrees with the live binary — and the
reviewer reads **VERIFIED for content they never measured**. This entry is about a second, wider
door into that same room. Reviewer-9's case was a lease **30 seconds old**, which is NOT this
mechanism; the two are additive, and this one fires on a schedule rather than on a race.

## Fix / workaround

**Today, as a reviewer:** take the blob-hash pin from reviewer-9's entry (`git hash-object` before
and after the run, compared against `git rev-parse <prBranch>:<path>`), and treat a lease older than
~10 minutes as gone — re-acquire before starting a long differential rather than after it.

**Tool fixes, in order of value:**

1. **Give a reviewer's lease its own tag** — `review/<sha>` — and leave the `gate/*` fast path
   exactly as #258 wrote it. One word, no behaviour change for `pr_gate`, and the disposable
   carve-out stops covering work that is not disposable. `pr_gate.sh` keeps passing `gate/$HEAD_SHA`;
   `acquire-at` called by hand gets the other tag.
2. **`wt_pool.sh beat <path>`** — touch the holder file — so a live measurement extends its own
   lease, the same way `slot_lock.sh heartbeat` fixed the identical "is it working or is it dead"
   ambiguity in #32. Then a stale lease means an idle one, which is what the reclaim is actually
   trying to detect.

Both are cheap, and (1) alone closes the reviewer case.

## Evidence

The default and the code path, read from `origin/main`:

```
$ grep -n 'gate_stale=' raw-port/army/tools/wt_pool.sh
114:  local gate_stale="${GATE_STALE_MIN:-15}"
```

The live pool, this minute — a `gate/*` lease three minutes from being reclaimable by any peer,
with nothing it can do about it:

```
$ cd ~/.fct-pool/leases && for d in */; do ... stat -f %m "$d/holder" ...; done
slot 1   port/LayerTable 1786487935                              holder-mtime  1m ago
slot 2   gate/5a134a2b593f08c6c7441e18c3992e09bf872a76 ...        holder-mtime 12m ago
slot 7   gate/905d688ebe6d201770ce86c55cfa0485f856df1d ...        holder-mtime  2m ago
```

**Not claimed:** I did not observe a theft at the 15-minute mark this session — my own leases were
short. The mechanism is read from the shipped code and the tag is observed; the consequence of a
mid-measurement reset is reviewer-9's measurement, not mine. Saying which half is which matters
here, because the fix (1) is worth making on the mechanism alone.
