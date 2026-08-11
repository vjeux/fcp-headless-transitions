# the mandated TS-driver recipe cannot load 40 ported files

- **reported** 2026-08-11T20:24:06Z by reviewer-3
- **status** OPEN (diagnosis + a one-word change of advice; no code change proposed here)

## Symptom

OPS_LOG's standing rule for reviewers is "before crediting *oracle-verified*, grep the harness for a
TS driver", and the recipe it names is **`node --experimental-strip-types`** importing the shipped
file. I went to apply it on PR #645 and the shipped port would not load at all:

    $ node --experimental-strip-types /tmp/driver.mts
    SyntaxError: The requested module '../infra/CMTime.js' does not provide an export named 'CMTime'
      at #_instantiate (node:internal/modules/esm/module_job:248:21)

`raw-port/src/nodes/OZConstantNode.ts` line 68 is `import { CMTime } from "../infra/CMTime.js"`, and
`CMTime` is `export interface CMTime` — a type. `tsc --noEmit` accepts a value-import of a type
(`moduleResolution: "bundler"`, no `verbatimModuleSyntax`), so G2 is green; Node's type stripping
does not erase a named import it cannot prove is a type, so the module dies at instantiation.

It is not one file, and it is not only that cause. Measured on a random sample of 60 files from
`raw-port/src`:

    node --experimental-strip-types :  21 of 60 fail to import   (35%)
    tsx  (v4.23.0)                  :   0 of 60 fail

Two distinct causes are mixed in that 21: the type-value import above, and **extensionless relative
specifiers** (`from "../infra/CMTime"`, which is the house convention — 83 files in one directory
tree alone, and correct under `moduleResolution: "bundler"`, but not resolvable by Node).

So the rule that a harness must run the port is right, and the recipe attached to it is unavailable
for roughly a third of the ported tree — including, by construction, the files most likely to want
an oracle.

## Root cause

The recipe names the wrong runner. `tsx` is already vendored at
`raw-port/node_modules/.bin/tsx`, it resolves extensionless specifiers and erases type-only imports,
and the best-instrumented harness in the tree (`OZSplineNode_compare_oracle.py`, PR #644) already
uses it — `subprocess.run([tsx, TS_DRIVER], ...)`. The two harnesses I had to hand-close today
(#637, #645) and the recipe in OPS_LOG all reach for `node --experimental-strip-types` instead.

Nothing about the ported files is wrong: `import { CMTime }` compiles, and extensionless imports are
the deliberate convention. It is the instruction that does not match the tree.

## Fix / workaround

**Change the advice, not the 1,720 files.** Wherever OPS_LOG, AGENT_ENTRY or a brief says
`node --experimental-strip-types`, the working form is

    raw-port/node_modules/.bin/tsx <driver>.mts        # 0 of 60 sampled files fail

A reviewer who is mid-review and hits the SyntaxError with the old recipe has two workarounds that
do not touch the branch: run the driver under `tsx`, or register a resolve hook that appends `.ts`
and maps `.js` -> `.ts` (what I used before I found `tsx`, ~10 lines).

If someone does want the files themselves to be Node-loadable, the change is mechanical and
per-file — `import type { CMTime }` for the 41 files that value-import that one interface — but it
is worth noting that fixes only one of the two causes, and the extensionless-specifier cause is the
convention itself. **Changing the recipe is one line; changing the tree is not, and would buy
nothing `tsx` does not already give.**

Not proposed here, but worth someone's judgement: G2 could pass `--verbatimModuleSyntax` so a
value-import of a type is a compile error at the gate rather than a runtime surprise in a harness.
That would reject 41 currently-landed files, so it needs a migration, not a flag flip.

## Evidence

```
$ sed -n '68p' raw-port/src/nodes/OZConstantNode.ts
import { CMTime } from "../infra/CMTime.js";

$ grep -n "^export interface CMTime" raw-port/src/infra/CMTime.ts
35:export interface CMTime {

# every file that value-imports that interface, actually executed:
$ grep -rlE '^import \{[^}]*\bCMTime\b[^}]*\} from' raw-port/src --include=*.ts | wc -l
41
   node --experimental-strip-types :  41 of 41 FAIL to load
   tsx v4.23.0                     :   0 of 41 fail

# 69 other files already say `import type { CMTime }`, so the correct form is in the tree already.

# random 60-file sample of raw-port/src (1,720 .ts files total):
   node --experimental-strip-types :  21 of 60 fail   (35%)
   tsx v4.23.0                     :   0 of 60 fail

$ grep -n "tsx" raw-port/re/oracle/OZSplineNode_compare_oracle.py
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    p = subprocess.run([tsx, TS_DRIVER], input=json.dumps(wire), ...)
```
