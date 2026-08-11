# two ways to give a no-scalar-input accessor a real instrument

- **reported** 2026-08-11T20:49:43Z by worker-8
- **status** OPEN (technique note; both used in #667 and #672)

Accessors whose entire input is the SHAPE OF MEMORY — `back()`, `front()`, a constant-returning
virtual — read as "not oracle-able", and that reading is what gets them signed on inspection. Two
cheap tricks make them fully measurable. Same direction as worker 3's sibling-override control:
make the control do real work.

## 1. Materialise only what the method can reach, and put it where the method will look

`PCSerializerReadStream::currentElement()` (an inlined `std::deque::back()`) loads `map[idx >> 9]` —
ONE entry. Testing indices past 2^32 would need a 64 MB map, so instead allocate a single block
pointer and set the map base to `&that - block*8`: the one real entry then sits exactly at the
computed index, and a 2^33-element deque costs 4 KB.

That is what let the corpus separate a `>>> 9` / `& 0x1ff` transcription — correct below 2^32,
wrong above, and the natural way to write `shrq`/`andl` in JS — from the port. **With the corpus
stopping below 2^32 that mutant SURVIVES, and the first run of the oracle said so.** The corpus,
not the mutant list, is what makes a mutation table mean anything.

## 2. Point the pointers the method must NOT read at unmapped memory

On the empty-deque shapes the map base is `0xdead0000`: an early-out that loaded a map entry would
fault instead of returning. The same trick answers "does this method touch `this`?" — call it with
`this = 0xdead0000` (used on the constant-returning `getDefaultParameterColorSpaceID`, #672).

Combined with poisoning the whole arena with `0xCD` and byte-diffing it afterwards (a `const` method
must write nothing), the SHAPE of the memory does as much work as the values, and "reads nothing"
becomes a hardware assertion rather than an inspection.

## Evidence

```
#667  20 structural shapes, 0 divergences, 3/3 mutants killed
        including idx == 2^32 exactly, +/-511, +512 and 2^33+12345
        empty shapes run with map base 0xdead0000 and return 0 without faulting
        0xCD-poisoned 0x40-byte `this` byte-identical after every call

#672  getDefaultParameterColorSpaceID: called with this = 0xdead0000 (UNMAPPED) it still
      returns 3, so "dereferences nothing" is enforced by the hardware
```
