# A field default that no instruction supports, in a file where every sibling grounds its own

**Reported 2026-08-11 by reviewer 4, found while reviewing PR #738
(`HGGPURenderer::GetMaxTileArea` @Helium 0x15d90, ACCEPTED and landed — the ported method is
faithful and oracle-verified; this is about the field it reads).**

## The instance

The PR adds

    defaultPageSize_at_0x294 = 0;

with a long, accurate doc comment naming the field's single writer
(`HGGPURenderer::InitDefaultPageSize` @0x9ee0) and its two other readers (`GetParameter` @0xd54c,
`PageInit` @0x15bf8). Every one of those claims checks out at its own address. What the comment
never says is where the **initial value** comes from — and I checked:
`HGGPURenderer::HGGPURenderer(unsigned long long, bool)` @0x88a0 writes **nothing** in [0x200,0x300)
and calls no `memset`. The slot is indeterminate until `InitDefaultPageSize()` runs. (The ctor does
initialise the clamp neighbour, `movl $0x800, 0x4e0(%rbx)` @0x892f, which confirms the region is
otherwise deliberately untouched rather than that I looked in the wrong place.)

So `= 0` is a TypeScript necessity standing where the file's four other fields put evidence:

* `textureStorageHint_at_0x4f0 = 1` — "defaulting to the ctor's 1";
* `renderEvent_at_0x530 = null` — cites the ctor's 16-byte `movups` (verified separately in #688);
* `maxMultiSamples_at_0x590 = 0` — grounded in the ctor;
* `glState_at_0x490 = null` — says outright that its initialiser is **out of scope** for the unit.

That last one is the pattern to copy: it does not pretend, it *declares the gap*.

## Why it matters more than a missing sentence

`0` is a plausible-looking wrong value, which is this project's most expensive failure shape (#13,
#154, and the `@0xADDR`-cited-but-unfounded constants generally). Here it makes `GetMaxTileArea()`
return 0 — a number that will look like a legitimate answer to anyone who has not read
`InitDefaultPageSize`. And because every neighbour in the same file explains itself, the bare `= 0`
reads as *decoded* rather than as *placeholder*: the very consistency that makes this file good is
what makes the one unexplained default misleading.

This is the same lesson as the earlier `HGRenderNode` entry ("when a port declares a FIELD DEFAULT,
the ctor is usually one `disasm.sh` away — check it, because the gate cannot"), but the other way
round. There, the port declared the ctor unavailable when it was not. Here the ctor IS decoded, in
the same file, for other fields — and this field's default simply never says which case it is.

## What to do

**Authors**: a field default needs one of exactly three sentences, and the third is free:

1. "the ctor at @0xADDR writes `<value>` here" — the instruction, cited;
2. "the ctor zeroes it as part of `<the wider store>` @0xADDR";
3. "**no decoded instruction initialises this slot** — the ctor does not touch it, so this value is
   a placeholder until `<writer>` runs".

Never a bare initialiser with no note. Option 3 costs nothing and is the honest answer surprisingly
often.

**Reviewers**: when a port adds a field with an initialiser, grep the ctor for that displacement
before signing. It is one `disasm.sh` and one `grep`, it is not covered by any gate, and on this
occasion it took under a minute:

    bash raw-port/tools/disasm.sh --sym <ctor mangled> <FW>
    grep -nE '0x294\(%r' raw-port/re/disasm/<FW>.<ctor>.s     # and check for memset/bzero too

**A check worth having**: a new field declaration in `raw-port/src/**` whose initialiser is a
literal, where the surrounding doc comment contains no `@0x` citation within its own block, is a
mechanical pattern — the same `--new-only` delta shape as `check_duplicate_classes`, so it would not
red-gate the existing tree. It would have flagged this line and left the other four alone, since
each of those carries an address in its own comment.
