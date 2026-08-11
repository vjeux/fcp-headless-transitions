# A differential that builds its two sides separately does not catch an inverted predicate — it confirms one

**Reported 2026-08-11 by reviewer 4, found on PR #741
(`CoreMediaMovieReader_Query::newMutableDecompressionSessionForCapabilityTesting` @Flexo 0xdee040).
The PR carried a green gate, a 30-instruction transcription that is exact, a live oracle reporting
every check PASS, and a thorough REQUEST_CHANGES from another reviewer that found a different, real
defect. The inverted guard survived all four.**

## The instance

    0xdee040  cmpq $0x0, 0x58(%rdi)
    0xdee045  je   0xdee09e            ; -> xorl %eax,%eax ; retq

`je` is taken when +0x58 is **zero**, so the live function returns NULL for an object with **no**
session and takes the create path for one that **has** a session. The port:

    if (this.sessionAt0x58 !== null) { return null; }

which is the opposite, and therefore wrong on both of the two inputs that exist.

## Why every instrument agreed with it

The oracle was written by the same reading, and — this is the part worth internalising — its two
sides are driven from **separately constructed inputs**, so the harness cannot express the
comparison that would have failed:

| what the harness does | what it says it measures | what it actually measures |
|---|---|---|
| live `fn(arena(0xBEEF0000))` (+0x58 non-NULL) | "an object that already has a session returns NULL" | the **create** path: VideoToolbox is called with a NULL format description, refuses, leaves the out-parameter NULL. The early exit never ran. |
| live, in a forked child, `fn(arena(0, 0))` (+0x58 NULL) | "the create path returns NULL when VideoToolbox refuses" | the **frameless early exit**. The child never reached VideoToolbox. |
| TS with `sessionAt0x58 = {marker}` (non-NULL) | "TS == live on the early-exit path" | the port's early-return, compared against a live result from a *different branch* |
| TS with the field NULL | "TS raises at the VideoToolbox boundary" | the port's create path, compared against nothing |

Every check passes. Every label is attached to the opposite path. And the fork built to keep a
VideoToolbox call out of the parent process ended up running that call **in** the parent, while the
child ran the branch that cannot crash.

The root cause is structural, not careless: **no single input was ever run through both sides.**
The live side got a C arena built by one function and the TS side got an object built by another,
and the only thing tying them together was the author's belief about which input meant what. When
that belief is the thing under test, a differential shaped like this returns "agree" for two
opposite behaviours — both were NULL, for unrelated reasons.

## Why the other defences could not see it

* **The gate**: the body throws at the VideoToolbox boundary before reaching anything G5 could
  judge, and an inverted `if` is not a cheat shape. G1/G6/G7 have nothing to say about branch sense.
* **A careful human read**: the comment block above the code is *correct* — it transcribes
  `je 0xdee09e` and its target accurately. Reading the comment against the disassembly confirms the
  comment. The defect is that the executable `if` contradicts the comment three lines below it, and
  a reviewer checking "is the disasm faithfully described" answers yes. The first reviewer verified
  all 30 instructions, quoted this exact branch, and still landed on approve-after-one-fix.
* **`reach_check`**: the throw above dominates the create path, so the fuzz sees nothing.

## What to do

**For anyone writing an oracle (this is the cheap, mechanical fix):** build ONE case list and drive
both sides from it, per case.

    CASES = [{"name": ..., "sessionAt0x58": 0, "formatDescription": 0}, ...]
    for c in CASES:
        live = call_live(arena_from(c))
        port = call_ts(object_from(c))
        check(f"{c['name']}: live == port", live == port, ...)

so that `live(case) == port(case)` is the only comparison the harness is *able* to express. Under
that shape the case `{sessionAt0x58: 0}` fails immediately — live returns NULL, the port throws —
which is exactly the defect. Two arenas built by two constructors and compared pairwise by index is
the anti-pattern; one case, two builders, one comparison is the fix.

**For reviewers**, a 10-second check that would have caught it, and which reading the comment block
does not: for every `j<cc>` in the cited disassembly, state the condition **in terms of the field**
("taken when +0x58 IS zero") and then read the TS predicate on its own, without the comment above
it. `je`/`jne`, `jl`/`jge` and `jbe`/`ja` after a `cmp $0x0` are where this lives. On this project
the comment is usually right, so compare the CODE to the DISASM, never the code to the comment.

**A guard worth considering, and it can be narrow enough to be worth having:** where a TS statement
carries a `// @0xADDR … cmp $0x0, <disp>(%r..) ; je <target>` annotation and the next statement is
`if (<expr> !== null)` (or `!== 0`), the sense is invertible mechanically — `je` after `cmp $0x0`
means the guarded early path is the `=== null` one. That is a small, high-signal pattern:
the annotation already names the instruction, so the check does not have to re-derive anything. It
would want `pr_gate --new-only`, like `check_duplicate_classes`, and it must be watched failing on
this PR's current head before anyone trusts it.
