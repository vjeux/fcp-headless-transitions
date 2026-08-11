# `OZChannelBase` models the `+0x38` flags word TWICE, and `isLocked` reads the copy nothing ever writes

**Reported 2026-08-11 by reviewer 5, found while reviewing PR #660 (landed). Pre-existing on main; not that PR's defect.**

## The finding

`raw-port/src/channels/OZChannelBase.ts` declares two private fields for the one qword at
`this+0x38`:

    717:  private __flags_word_at_0x38: bigint = 0n;
    1365: private __flags_at_0x38: bigint = 0n;

Both are members of the same `OZChannelBase` class (opened at line 165), each with its own decode
comment. Every use in the file, with the enclosing method:

    727  read  __flags_word_at_0x38  in getAncestorRootBase
    810  read  __flags_word_at_0x38  in setChildSolo
    824  WRITE __flags_word_at_0x38  in setChildSolo
    887  read  __flags_word_at_0x38  in saveStateAsDefault
    889  read  __flags_word_at_0x38  in saveStateAsDefault
    1273 read  __flags_word_at_0x38  in setNameUnset
    1279 WRITE __flags_word_at_0x38  in setNameUnset
    1460 read  __flags_at_0x38       in isLocked            <- the only use of the second field

**Both writers touch one field; `isLocked` reads the other, and nothing in the file ever assigns it.**
So `isLocked` can only ever observe `0n`.

In the binary there is no such split. Derived today:

    __ZNK13OZChannelBase8isLockedEb @ProChannel 0x4b976
      4b97e  movq 0x38(%rdi), %rcx        <- the SAME qword setChildSolo ORs bit 20 into
      4b982  andl $0x4, %ecx                 and setNameUnset writes
      4b987  shrl $0x2, %eax

## How bad, honestly

**Latent today, not yet observable.** `isLocked` masks bit 2, and neither landed setter sets bit 2 —
`setChildSolo` uses bit 19/20 and `setNameUnset` its own bits — so no currently landed call sequence
can tell the two fields apart. It becomes a live wrong answer the moment a unit that writes bit 2
through the setters' field is ported, and it will present as a correct-looking, throw-free method
that returns `false` forever. The transcription of `isLocked` is otherwise faithful: it walks
`0x30(%rdi)` parents, honours the first-iteration `sil` test, and cites every instruction.

## Why nothing catches it

* **G6 add-only** sees each append in isolation; neither field was dropped.
* **G5** judges each export against its own disassembly. `isLocked` reads *a* 64-bit field and masks
  bit 2 — which is exactly what 0x4b97e-0x4b982 does. The disagreement is between two TypeScript
  fields, and no disassembly mentions either name.
* **`check_duplicate_classes.py`** compares file basenames across layer directories. Two fields
  inside one class are invisible to it.
* **An oracle does not see it either**, and PR #660's driver shows why: it sets *both* fields —
  `(o as any).__flags_word_at_0x38 = …; (o as any).__flags_at_0x38 = …;` with the comment
  *"(the file's second +0x38 model)"* — so whichever the method reads, the harness has populated it.
  A harness that works around the split is the most likely way this gets normalised rather than
  fixed.

This is the "two models of one C++ thing silently drift" hazard that `check_duplicate_classes` was
written for, one level below the granularity it operates at: not two files for one class, but two
fields for one struct offset.

## Fix

1. **Reconcile the two fields in `OZChannelBase.ts`** — keep `__flags_word_at_0x38` (it has the
   writers) and point `isLocked` at it. It is a one-line change plus a comment merge, but it is an
   edit to a landed method, so it wants its own PR and a reviewer who re-derives `isLocked`; do not
   fold it into an unrelated port.
2. **A cheap mechanical guard that would catch the whole class**: for each `src/**/*.ts`, group
   private field declarations whose *name or doc comment* cites the same `+0xNN` offset within one
   class, and reject two names for one offset. Every field in this repo carries its offset in its
   name by convention (`__flags_word_at_0x38`, `__default_state_word_at_0x40`,
   `parameterCtlrClassNameAt58`), so a regex over the declaration lines gets most of it, and the
   convention is worth enforcing for exactly this reason. Wire it into `pr_gate` on the delta
   (`--new-only`), the way `check_duplicate_classes` was, so a pre-existing pair does not red-gate
   every PR that touches the file — and **watch it fail once before trusting it**: today
   `OZChannelBase.ts` is a live positive.
3. **Reviewer-side, until then**: when a port appends a method that reads a struct slot, grep the
   file for the offset (`grep -n '0x38' <file> | grep private`) and check there is exactly one field
   for it. That is what turned this up.
