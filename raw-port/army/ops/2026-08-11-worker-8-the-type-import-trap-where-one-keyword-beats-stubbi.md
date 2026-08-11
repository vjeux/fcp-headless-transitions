# worker 8: the type-import trap, where one keyword beats stubbing the graph

- **reported** 2026-08-11T20:49:43Z by worker-8
- **status** OPEN (an addendum to worker 3's entry, landed as #666 / OPS_LOG)

**Read worker 3's entry first** — same trap, found independently twenty minutes earlier, and it
carries the general diagnosis and the stub-the-graph workaround. This is only what mine adds.

## Symptom

Two additions, both measured on node v24.2.0 while oracling `PCSerializerReadStream::currentElement`
(#667).

1. **`--experimental-transform-types` fails IDENTICALLY**, so "use the other flag" is not a way out.
   Worker 3's entry says stripping "cannot, by design" elide a named import of a type; the natural
   next move is the bigger hammer, because transform-types DOES handle what strip-types refuses
   (enums, parameter properties). It costs a minute and returns the same stack trace.
2. A second stripping refusal, in the DRIVER rather than the port: a TypeScript **parameter
   property** (`constructor(public addr: number) {}`) dies with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`,
   because stripping may only erase, never emit. Declare the field and assign it.

## Root cause

Type stripping erases annotations; it cannot know that a NAMED import is a type, so it keeps the
whole clause and the module fails at instantiation. Both flags share that front end.

## Fix / workaround

**When the offending import is in the file YOUR OWN unit extends, fix it there — one line,
gate-clean, and it beats stubbing.** Worker 3's entry says "they are LANDED FILES in other classes,
so a port PR cannot go fixing them", which is right for a chain two modules deep and wrong for the
commonest case: the top of the chain is very often the class file the worker is already extending.

```diff
-import { CMTime, kCMTimeFlags_Valid } from "./CMTime.js";
+import { kCMTimeFlags_Valid } from "./CMTime.js";
+import type { CMTime } from "./CMTime.js";
```

Done in #667 (OPEN at the time of writing — main's copy of `src/infra/PCSerializerReadStream.ts:17`
still shows the unsplit import until it lands). `GATE: PASS`, G6 reports add-only (+19 addr, +1
decl — an import split deletes no declaration), and the differential went from IMPOSSIBLE to 20
shapes / 0 divergences against the live binary, with no stub hook and the real module graph loaded.

Rule of thumb: **stub the graph when the broken import is in someone else's class; fix the keyword
when it is in yours** — a stub is a thing a reviewer must check, a keyword is not. This is also
evidence for worker 3's proposed sweep: each site is independently landable by whoever is next in
that file.

## Evidence

```
$ node --experimental-strip-types     driver.mts
$ node --experimental-transform-types driver.mts     # identical, both on node v24.2.0
SyntaxError: The requested module './CMTime.js' does not provide an export named 'CMTime'
    at #_instantiate (node:internal/modules/esm/module_job:248:21)

src/infra/CMTime.ts:35:  export interface CMTime {          # a TYPE, imported as a VALUE
src/infra/PCSerializerReadStream.ts:17:
    import { CMTime, kCMTimeFlags_Valid } from "./CMTime.js";

after the split, same driver:
  ok  TS == live, every shape: 20/20 agree on the returned element
```
