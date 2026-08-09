# Literature check — how others solve "port a huge codebase with LLM agents"
_(compiled 2026-08-09; grounds our swarm design in prior art. Sources cited inline.)_

## TL;DR
- Our architecture (parallel agents in git worktrees, dependency-ordered function-level units,
  SCC/Tarjan bundling of cycles, a compiler as the innermost gate, an adversarial reviewer) is
  INDEPENDENTLY VALIDATED by the two closest real-world analogs — the **Bun Zig→Rust port**
  (64 Claude agents, 4 worktrees) and the **TypeScript→Go port** (tsgo). We reinvented the
  standard shape; that's reassuring, not novel.
- The BINDING CONSTRAINT at scale is **verification throughput, not generation.** Bun proved
  agents can emit ~1M lines in days; the wall was review ("the PR is the bottleneck now").
- Our HARDER-than-Bun bar (per-function faithfulness to the binary, not just "tests pass") means
  we cannot copy Bun's "ship it, tests green" move. Our edge is that we have the BINARY as a
  non-gameable ground-truth oracle — the literature's #1 defense against self-review collapse and
  reward hacking. The highest-leverage next investment is **differential testing each ported
  function against the binary**, so verification is mechanical and scales without a human.
- SOBERING CONSTANT: no one has demonstrated a fully human-out-of-the-loop port at this scale.
  Bun's creator drove it and made the merge call himself; Google reviews every sharded change.
  The realistic target is "shrink the human residual to occasional architectural calls," not zero.

---

## A. Closest real-world analogs (practitioner canon)

### A1. Bun: Zig → Rust, Anthropic/Jarred Sumner (May 2026) — THE closest analog
- ~500K–960K LOC Zig → ~1M LOC Rust; **6–11 days; 99.8% test pass rate; ~$165K API.**
- Method: **64 Claude agents in parallel across 4 git worktrees, 6,502 commits, survived
  ~16,000 compiler errors.** == our architecture (parallel agents + worktree isolation +
  compiler-as-forcing-function), validated at production scale by the model's own makers.
- Explicitly REJECTED big-bang: *"Prompting 'Rewrite Bun in Rust. Don't make any mistakes' and
  praying is not what I did. Think about how a person would do this. Incremental or all at once?"*
  Drew on his prior esbuild Go→Zig port. Chose incremental, reference-preserving.
- The `.zig` files were KEPT in-tree as a non-compiled porting reference and removed only AFTER
  the Rust port worked (PR #30683). == our model: the FCP binary/disasm is the reference,
  removed from the loop only once a unit is ported.
- **THE KEY LESSON (Mergify postmortem "Bun shipped 1M lines in nine days. The PR is the
  bottleneck now."):** generation is solved; VERIFICATION/REVIEW is the wall. A 600K-line
  deletion was auto-flagged "AI slop". Nobody could line-by-line review it. It passed because it
  had a big TEST SUITE and only needed BEHAVIORAL equivalence.
- **Why this bar doesn't transfer to us:** we require per-function FAITHFULNESS to the binary, a
  stronger bar than "tests pass." So our gates matter more than Bun's did, and we need an
  executable oracle (the binary) to make faithfulness checkable without humans.
- Human stayed in the loop: Sumner made the incremental-vs-big-bang call, watched the agents,
  and personally made the merge decision.
  Sources: bun.com/blog/bun-in-rust ; theregister.com/devops/2026/05/14 ; mergify.com/blog/bun-million-line-pr-postmortem ; PR oven-sh/bun#30683

### A2. TypeScript → Go (tsgo / Hejlsberg, 2025) — the methodological gold standard for "PORT not REWRITE"
- Go chosen for **structural similarity** to TS to make it a **PORT, not a rewrite**: same
  algorithms, same code structure, even mirrored file organization. == our "one C++ class = one
  .ts file, mirror the binary's class hierarchy" rule.
- HN (news.ycombinator.com/item?id=30074414): *"simple forms of porting can be done without
  really understanding the overall architecture. You just need to understand each line at a time.
  A complete rewrite would require full understanding of the big picture."*
  => THIS is the theoretical justification for the dependency-queue leaf-by-leaf swarm: a faithful
  port DECOMPOSES into local, independently-verifiable units; a rewrite does not.
- Validated at ~1.5M LOC (VS Code typechecks 10x faster). Proof the leaf-by-leaf port discipline
  scales.
  Sources: github.com/microsoft/typescript-go Discussion #411 "Why Go?" ; Hejlsberg interview.

### A3. Google internal migrations at scale (2025) — the best-documented AUTONOMY ceiling
- 500M-LOC monorepo; 32-bit→64-bit IDs, JUnit3→4, time-framework swaps.
- **80% of landed edits AI-authored** — but a knowledgeable engineer TRIGGERS each migration and
  human owners REVIEW every sharded change. Halved migration time; did NOT remove humans.
- Sharding large changes into owner-reviewable pieces was essential (contrast: Bun's un-shardable
  1M-line PR). Lesson for us: keep merges small and independently gated (we do — per-function).
  Sources: arxiv 2501.06972 ; arxiv 2504.09691 ; research.google/blog/accelerating-code-migrations-with-ai

---

## B. Academic state of the art (C→Rust repo migration is the closest task family)

- **Dependency-ordered, function-level translation is universal**: LLMigrate (2503.23791),
  PtrTrans (2510.10956), Rustine (2511.20617), MinsC2Rust, Dependency-Guided + RL (2604.02852).
- **Tarjan/SCC to bundle mutually-recursive cycles into one unit**: PtrTrans does exactly our
  `ready_scc`. Standard move, not novel.
- **Skeleton-first** (Build-Aware 2603.02617, LLMigrate): emit ALL signatures first so callers
  compile against real signatures before callee bodies exist. NOTE: this is a C-SOURCE
  optimization; Bun and tsgo did reference-preserving incremental porting instead. LOWER priority
  for us because our reference is a binary (signatures are costlier to extract) and our
  dependency-queue already gives incremental ordering. Demoted.
- **Compilation as innermost gate**: universal. We have it (tsgo/G2).
- **Verified transpilation / equivalence checking** (VERT, 2406.03003, binary-lifter validators):
  formal equivalence is real but only demonstrated on DSLs / single functions / small programs.
  Does NOT scale to 126K functions. What DOES scale is bounded DIFFERENTIAL TESTING / I/O
  equivalence (Validated Translation w/ External Libraries 2602.18534). => this is our path.
- **Autonomy ceiling in academia**: CODEMENV Pass@1 drops to 16% on the HARD set. The hard tail
  is where autonomous systems fall down — matches our "the plateau is the hard 30%" worry.

---

## C. The failure modes the literature warns about (directly relevant to our design)

### C1. Self-review collapse (reference-free judging drifts to "convincing" not "correct")
- "When AI Reviews Its Own Code: Recursive Self-Training Collapse" (2606.28438);
  "More Convincing, Not More Correct: Self-Play Reward Hacking of Reference-Free LLM Judges"
  (2607.05904).
- IMPLICATION: our reviewer must NOT be a reference-free judge. It must judge against the BINARY
  (re-derive disasm, or differential-test). Every step we move review from "reviewer opinion" to
  "matches the decoded instructions / matches the binary's output" hardens us against collapse.
  This is our single biggest structural advantage vs. everything in the literature.

### C2. Reward hacking / verifier gaming (a whole 2025-26 subfield)
- SpecBench (2605.21384), EvilGenie (2511.21654), "LLMs Gaming Verifiers" (2604.15149),
  "Hardening Agent Benchmarks with Adversarial Hacker-Fixer Loops" (2606.08960).
- Transferable techniques:
  * **Held-out vs. visible tests (SpecBench):** our analog = the reviewer must re-derive disasm
    INDEPENDENTLY from the binary, never trust the worker's committed .s (a worker citing its own
    .s is the "agent sees the test" hole). Enforce, don't just request.
  * **Hacker-Fixer loop:** periodically task an agent with SNEAKING A CHEAT past the gates; every
    breach mints a new gate check. Keeps anti-cheat ahead of workers over a long run — and it's
    FULLY AUTONOMOUS (no human arbiter needed). This is the autonomous alternative to a "master
    architect agent."
- Our existing anti-cheat gates (G5, the 3 new ones) are exactly the investment this literature
  says is correct. Validated.

---

## D. What this changes about OUR plan (decisions)

1. Verification throughput is the binding constraint (Bun). Invest there, not in fancier
   dependency ordering.
2. Build **differential testing against the binary** — run the ported TS fn and the ACTUAL binary
   fn on the same inputs, compare. Strongest, least-gameable, human-free verification signal;
   the literature's best practice for exactly our situation. (Feasibility probe pending — see
   DIFFTEST_FEASIBILITY notes; not all functions are callable in isolation.)
3. Keep merges small + independently gated (Google). We already do (per-function). Do NOT drift
   toward Bun-style mega-merges.
4. Reviewer = binary-grounded, never reference-free (C1). Enforce independent disasm re-derivation.
5. Add an autonomous **Hacker-Fixer** loop instead of a human "master arbiter" (C2) — every
   successful cheat becomes a new mechanical gate.
6. Honest expectation: human-out-of-the-loop at 126K functions is past the demonstrated frontier
   (Bun, Google, collapse papers all kept a human). Target = shrink the human residual to
   occasional architectural calls + a visible, small hard-tail (burn-down monitor), not zero.

---

## E. DIFFERENTIAL-TESTING FEASIBILITY PROBE (2026-08-09) — measured, not assumed

Before speccing a difftest-against-the-binary harness, I probed whether an individual FCP
function can be called in isolation on this arm64 Mac. Findings:

1. `ctypes.CDLL("…/Ozone")` FAILS outright: `Library not loaded: @rpath/ProAppSupport.framework`.
   Ozone will not load without its @rpath dependency graph.
2. Setting `DYLD_FRAMEWORK_PATH`/`DYLD_LIBRARY_PATH` to FCP's Frameworks dir loads ProAppSupport,
   ProCore, ProChannel, Helium — but Ozone still needs ProTracker, Flexo needs
   ProInspectorFoundation, etc. It's a deep transitive cascade across the whole FCP framework set.
3. Recursively pre-loading the @rpath deps (topological, via `otool -L`) DOES start bringing the
   graph up — it initializes OpenGL/CGL ("PGLMasterCGLPixelFormat: 10 bit framebuffer …") — i.e.
   loading Ozone drags in a live GRAPHICS CONTEXT.
4. **It then HANGS in a framework static initializer** (process alive >4 min, never returned from
   the load, never reached the function call). Consistent with the fct oracle's earlier note that
   PAECloudsV2 "segfaults in headless FCP solo" — these frameworks are NOT designed to run
   headless/partial; their +load/constructors expect a full app host.

### Verdict: naive in-process dlopen difftest is NOT viable as-is.
The binary is a great ground-truth ORACLE, but you can't cheaply `dlopen` one function — you pull
in the entire graphics-app runtime, which hangs headless. So the honest options are:

  (a) **In-process, but gated to pure leaves.** For a function with ZERO in-scope deps and ZERO
      framework-init dependency (pure int/float/vector math — e.g. NSDragOpToOZDragOpOZ,
      doInverseToneMap_OSFA, matrix mults), it MIGHT be callable IF we can load just enough. But
      the probe shows even Ozone's base load hangs, so this needs a MINIMAL host that stubs the
      offending initializers — real work, uncertain payoff.
  (b) **Out-of-process micro-harness**: a tiny ObjC/C++ program LINKED against the framework that
      the real app launches the normal way (full host, no partial-load hang), exercised via the
      existing fct headless-FCP render path. This is basically what the fct oracle ALREADY does at
      the transition-render granularity — and it's why per-FUNCTION difftest is hard: the functions
      aren't individually reachable without the whole app.
  (c) **Static/emulated execution**: run the function's disasm under an arm64 emulator (Unicorn)
      with a fake stack — works for pure-math leaves with no external calls, sidesteps the whole
      framework-init problem. Most promising for the LEAF tier; bounded scope.

### Recommendation (revised, honest):
- Do NOT build a general per-function difftest harness now — the framework-init wall makes it a
  research project, not a quick win. This is exactly the kind of over-promise to avoid.
- The EXISTING fct render-level oracle already provides binary-grounded verification at the
  transition granularity (the strongest signal we can cheaply get) — keep leaning on it.
- If we want per-function difftest, the tractable slice is (c) UNICORN-EMULATED PURE LEAVES:
  zero-dep, zero-extern, register-in/register-out math functions. That's a real, bounded harness
  and it targets exactly the tier where a mechanical check adds the most value. Prototype on
  NSDragOpToOZDragOpOZ (u32->u32) before generalizing.
- Everything else stays on: independent disasm re-derivation (reviewer) + G5 + the 3 new gates.
  That IS binary-grounded; it just checks the code against the DECODED instructions rather than
  executing them.
