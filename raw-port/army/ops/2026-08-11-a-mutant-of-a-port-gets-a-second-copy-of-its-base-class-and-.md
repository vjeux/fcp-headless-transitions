# a mutant of a port gets a SECOND copy of its base class, and `instanceof` fails inside the port

- **reported** 2026-08-11T20:26:55Z by worker-1
- **status** FIXED in the harness it was found in (PR #644); OPEN as a pattern anyone writing a
  mutation control will hit

## Symptom

Building the mutation controls for a differential on `OZSplineNode::compare` @ProChannel 0x2a26e,
one of the three mutants came back **dead**:

    drop-cast            0 divergent cases — the dynamic_cast<OZSplineNode*> null check @0x2a2b3 removed
       !! DEAD MUTANT: 'drop-cast' changed nothing the corpus can see.

The mutant deletes the null test that guards a dereference. It is not equivalent — with it gone the
mutated port should either answer differently or crash. It did neither.

## Root cause

Not the mutant, and not the corpus: **module identity**.

Each mutant is a textual edit of the shipped file, written to a temp directory so that no gate or
`tsconfig` ever sees it. A copy outside `src/` cannot keep the original's relative imports, so the
harness rewrites them to absolute paths. Meanwhile the DRIVER imported the same sibling by its
normal relative specifier:

    mutant  : import { OZConstantNode } from "/Users/…/raw-port/src/nodes/OZConstantNode.js"
    driver  : import { OZConstantNode } from "../../src/nodes/OZConstantNode.js"

Node resolves those to two DIFFERENT module instances, so there are two distinct `OZConstantNode`
class objects with two distinct prototypes. The driver built its test objects from one; the port
tested `other instanceof OZConstantNode` against the other. That test is the port's model of
`__dynamic_cast`, so it answered `false` for an object that IS of that type — and the mutated port
returned 0 for the same reason the faithful one did, on every case.

The control was measuring the module graph, not the port. This is the failure mode OPS_LOG already
warns about in the abstract — *a dead negative control means your harness is blind OR your mutant is
equivalent* — with a third answer that is neither: **the harness and the thing under test were not
in the same universe.**

## Fix / workaround

**Do not import a class into the driver when you can read it off the object under test.** The base
prototype is reachable through the port's own prototype chain, which binds to whichever instance the
port actually uses, in both faithful and mutated runs:

```ts
const mod = (await import(portPath)) as { OZSplineNode: { prototype: object } };
const splineProto = mod.OZSplineNode.prototype;
const constProto = Object.getPrototypeOf(splineProto) as object;   // OZConstantNode.prototype
```

Two smaller rules from the same episode:

- **A mutant that CRASHES is a divergence, not a broken harness.** Once the identity bug was fixed,
  `drop-cast` did what it should — it dereferenced null and threw — and the harness aborted with
  "TS driver failed", which would have hidden a live control behind an error. Treat a non-zero exit
  from a MUTANT run as "divergent on every case"; keep it fatal for the unmutated run.
- **Print M0 next to the mutants.** M0 is the unmutated port through the same wire and must be 0. It
  is what tells you a mutant count is measuring the mutant and not the plumbing.

## Evidence

Before (identity bug present), all three mutants and the faithful run agreeing for the wrong reason:

```
M0   0 divergent cases — the port as shipped, re-run through the same wire
drop-cast            0 divergent cases   <- DEAD
drop-base            4 divergent cases
both-null-inverted   7 divergent cases
```

After reading the base prototype off the port under test, and counting a crashing mutant as
divergent:

```
15/15 cases identical to live ProChannel
M0   0 divergent cases — the port as shipped, re-run through the same wire
drop-cast          CRASHED — the dynamic_cast<OZSplineNode*> null check @0x2a2b3 removed
                   (the mutated port throws where the machine returns a value; that is a
                    divergence on every case)
drop-base            4 divergent cases
both-null-inverted   7 divergent cases
VERIFIED vs live ProChannel
```
