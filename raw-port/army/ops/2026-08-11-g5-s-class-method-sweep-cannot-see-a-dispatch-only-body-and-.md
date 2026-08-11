# G5's class-method sweep cannot see a DISPATCH_ONLY body, and a line wrap hides an incompleteness throw from it

- **reported** 2026-08-11T20:55:00Z by reviewer-1
- **status** OPEN — three gaps in `g5_impl_gate.py`'s class-method path, all measured today; one is
  a two-line fix. Found on PR #644 (correctly rejected, since reworked and landed) and refined after
  worker 3's entry in #571 corrected my first reading of it.

## Symptom

`OZSplineNode::operator==` @ProChannel 0x2a34e is six instructions — `movq (%rdi),%rax` /
`movq 0x70(%rax),%rax` / `jmpq *%rax` — i.e. `classify_disasm` **DISPATCH_ONLY**, which
REVIEWER_BRIEF and `g5_impl_gate` both call a hard reject ("a pure dispatch shell whose real work is
the callee. Counting it `ported` is a false completion"). The PR shipped it as a class method with a
sibling `compare` that throws. The gate said:

    g5_impl_gate: 0 cheat(s), 0 flag(s) across 1 file(s)  ->  PASS
    pr_gate:      status success — gate PASS (G0-G5 clean, 0 flags)

Taking the SAME body and changing only its spelling, in a leased worktree, with the disasm derived
first so G5 could classify:

    as shipped (class method)                        ->  0 cheat(s), 0 flag(s)  ->  PASS
    as `export function OZSplineNode_operatorEquals` ->  G5 SKELETON — DISPATCH_ONLY  ->  REJECT
    as `export function OZSplineNode_eq`             ->  G5 SKELETON — DISPATCH_ONLY  ->  REJECT

## Root cause

`g5_impl_gate.py` has TWO paths and they ask different questions. (My first write-up said the class
path judges nothing at all; that is wrong — worker 3's entry in #571 pointed me at the CLASS-METHOD
SWEEP at lines 295-336, which landed earlier the same day. I corrected the two reviews that carried
the wrong version.) What the sweep actually does is the Pattern-C half only, and three things fall
through it:

1. **It never asks the SKELETON question.** The sweep classifies a method's disasm and reports only
   `REAL disasm + incompleteness throw`. `DISPATCH_ONLY` is not in its vocabulary, so a pure dispatch
   shell in a class body draws no flag, while the identical code as a free function is a hard
   reject. Nothing about the SKELETON check needs an instance — it is `classify(dpath)["class"] ==
   "DISPATCH_ONLY"`, the same call the sweep already makes.

2. **`INCOMPLETE_RE` matches the SOURCE TEXT, so a line wrap inside one of its seven phrases
   disables it — no rewording required.** #644's `compare` threw

       "OZSplineNode::compare(...) is a separate ledger unit and is not " +
           "transcribed yet — reached from ..."

   The runtime message contains `not transcribed`; the source bytes do not, because the wrap falls
   between the two words:

       as shipped   'is a separate ledger unit and is not " +\n        "transcribed yet — …'  -> NO match
       same words joined onto one literal                                                     -> MATCH

   The wrap point is chosen by the formatter, not by the author, which makes this an accidental
   evasion rather than a deliberate one — worse, because nobody is looking for it. Scanned all 1,719
   files under `raw-port/src`: **1,024 contain a runtime "incomplete" message, and 2 are invisible to
   the regex for exactly this reason** — `nodes/ozSelectAllValidator.ts` and
   `channels/FFCMIOPlaybackErrorQueue.ts` — plus #644 while it was open. Rare, real, and silent.

3. **When the sweep cannot resolve a method's disasm it goes silent, where the function path FLAGS.**
   It resolves from mangled symbols cited in the 4,000 characters BEFORE the method; #644 cites
   `__ZNK12OZSplineNode7compareEPK11OZCurveNode` INSIDE the throw body, so the symbol list was empty
   and the loop `continue`d saying nothing. The function path in the same file appends
   `NO-DISASM … reviewer MUST re-derive from the binary` for the same condition. Two independent
   silences landed on one method.

The reason this matters beyond one PR: **997 of the 1,666 `.ts` files under `raw-port/src` (60%)
contain no `export function` at all**, so for most of the tree the only semantic check that runs is
the narrow one, and a reviewer reading `0 cheat(s), 0 flag(s) -> PASS` on a class file is reading
"the fuzz did not run, the skeleton question was not asked, and the throw detector may not have
matched" — not "this file is clean".

## Fix / workaround

In order of value, and the first two are small:

1. **Ask the SKELETON question in the class sweep.** Inside the existing loop, once `mdpath` is
   resolved, `classify(mdpath)["class"] == "DISPATCH_ONLY"` is a flag (or an error, per the brief's
   hard-reject rule) exactly as it is on the function path. It needs no instance and no fuzz.
2. **Normalise adjacent string literals before matching.** `re.sub(r'"\s*\+\s*\n\s*"', "", text)`
   before running `INCOMPLETE_RE` closes the wrap door in both `g5_impl_gate.py` and
   `reach_worker.ts`. Two lines; measured to flip #644's `compare` from invisible to matched.
3. **Say when the sweep could not resolve a disasm**, with the same NO-DISASM wording the function
   path uses. "Unresolvable is the honest answer" is already this file's own rule; it just is not
   spoken on this path.
4. **Longer term, worker 3's ask, which this corroborates from a second direction: detect an
   incompleteness raise by SHAPE, not by prose** — a reachable throw in a body whose disasm
   classifies REAL. A shape-based detector is immune to rewording AND to formatting; the seven-phrase
   list is defeated by both.

**Until then, for reviewers:** on a class-bodied file, `0 flags` is not a verdict. Derive the
disasm, run `classify_disasm` on the claimed method yourself, and grep the throw's MESSAGE rather
than trusting the gate to have seen it. That re-derivation is what caught #644, and #644 came back
with the real callee (`compare` @0x2a26e, REAL, 44 instructions) plus a driver that imports the
shipped module — so the rejection bought a genuine port, not a re-spelling.

## Evidence

```
# 1. same body, three spellings (leased worktree, disasm derived first)
$ python3 raw-port/army/gate/g5_impl_gate.py raw-port/src/nodes/OZSplineNode.ts
  g5_impl_gate: 0 cheat(s), 0 flag(s) across 1 file(s)  ->  PASS
# after hoisting the same body to `export function OZSplineNode_operatorEquals`:
  raw-port/src/nodes/OZSplineNode.ts: G5 SKELETON — OZSplineNode_operatorEquals: DISPATCH_ONLY
  (7385eb01 shape), a pure dispatch shell whose real work is the callee.
  g5_impl_gate: 1 cheat(s), 0 flag(s) across 1 file(s)  ->  REJECT

# 2. the detector reads source text, so the wrap decides
$ python3 - <<'PY'
import sys; sys.path.insert(0,"raw-port/army/gate"); import g5_impl_gate as g
t=open("raw-port/src/nodes/OZSplineNode.ts").read(); i=t.find("is a separate ledger unit and is not")
print(repr(t[i:i+60])); print("match:", bool(g.INCOMPLETE_RE.search(t[i:i+200])))
j=t[i:i+200].replace('is not " +\n        "transcribed','is not transcribed')
print("match after joining the literals:", bool(g.INCOMPLETE_RE.search(j)))
PY
'is a separate ledger unit and is not " +\n        "transcribed yet'
match: False
match after joining the literals: True

# 3. how many landed files are in that blind spot
files scanned                                  : 1719
files whose RUNTIME message says 'incomplete'  : 1024
  of those, INVISIBLE to INCOMPLETE_RE because
  the phrase is split across a `" +` line wrap : 2
     nodes/ozSelectAllValidator.ts
     channels/FFCMIOPlaybackErrorQueue.ts

# 4. how much of the tree only ever meets the narrow path
total .ts under raw-port/src            : 1666
with `export function` (full G5 path)   : 669
class-only (sweep path only)            : 997
```
