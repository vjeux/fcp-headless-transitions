// PCURL_ctorFromCFURL_driver.mts — the TS half of the PCURL C1 differential.
//
//   node --experimental-strip-types PCURL_ctorFromCFURL_driver.mts <module.ts>
//   stdin : {"cases":["null","nonnull"]}
//   stdout: {"null":{...},"nonnull":{...}}
//
// The module path is an argument so the shipped source and the mutant copies
// the oracle generates all run through ONE code path — a mutant reached by a
// different route would not be a control.
//
// The field is POISONED before each call, the TS analogue of the 0xCD arena on
// the machine side: without it, `url` defaults to null and the NULL case could
// not tell "the store executed" from "the initialiser ran", which is exactly
// the distinction this harness is about.
import { pathToFileURL } from "node:url";

const modPath = process.argv[2];
if (!modPath) {
  console.error("usage: PCURL_ctorFromCFURL_driver.mts <module.ts>");
  process.exit(2);
}

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
const { cases } = JSON.parse(raw) as { cases: string[] };

const mod = (await import(pathToFileURL(modPath).href)) as {
  PCURL: new () => {
    url: unknown;
    constructFromCFURL(url: unknown): void;
  };
};

const POISON = { __poison: "never stored by the ctor" };
const out: Record<string, { stored: boolean; threw: string | null }> = {};

for (const c of cases) {
  // a distinct surrogate per case: identity is what the store is judged on
  const arg = c === "null" ? null : { __brand: "CFURLRef", tag: c };
  const p = new mod.PCURL();
  p.url = POISON;
  let threw: string | null = null;
  try {
    p.constructFromCFURL(arg);
  } catch (e: unknown) {
    threw = String((e as Error)?.message ?? e).slice(0, 120);
  }
  out[c] = { stored: p.url === arg, threw };
}

process.stdout.write(JSON.stringify(out) + "\n");
