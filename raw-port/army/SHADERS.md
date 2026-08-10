# Porting FCP Metal shaders (the Hgc* per-pixel math)

The render nodes (Hgc*, HMask*, HGColor*) dispatch their per-pixel math to Metal shaders compiled
into `*.metallib` files under each framework's Resources/. These decompile to READABLE LLVM IR (AIR).

## Extract a shader's IR
`bash raw-port/tools/shader_disasm.sh <ShaderName> [framework]`
-> writes raw-port/re/shaders/<ShaderName>.ll (LLVM IR named exactly after the shader).
Omit the framework to search all metallibs; pass e.g. Helium/Flexo/Ozone to narrow.

## Transcribe to TS
- Target file: raw-port/src/shaders/<ShaderName>.ts  (ONE shader per file, named exactly after it).
- The shader signature is `<4 x float> @<Name>(<4 x float> %0 /*fragColor/params*/, <4 x float> %1
  /*texcoord0*/, ..., texture2d %N, sampler %M, float4* buffer)`. Model textures as a
  `sample(tex, uv) => [r,g,b,a]` callback param and the uniform buffer as a `Float32Array`/number[].
- Map AIR ops faithfully: `fadd/fsub/fmul/fdiv` (fp32 -> Math.fround), `fcmp` -> comparisons,
  `select` -> ternary, `shufflevector/extractelement/insertelement` -> lane index, `air.fast_floor`
  -> Math.floor(fround), `air.fast_pow` -> Math.fround(Math.pow), `air.fast_fmod`, `air.dot`,
  `air.fast_sqrt`, `air.sample_texture_2d.v4f32(tex,sampler,uv,...)` -> sample(tex, uv). `br`/labels
  -> if/else or a small block-structured translation. Cite each op's IR line (%N) in comments and put
  `// @shader <Name> (Helium/…)` provenance at the top.
- `fast`/`reassoc nsz arcp contract afn` flags = fast-math; use plain JS float ops (document it).
- Undecoded air.* intrinsics -> throwing stub citing the intrinsic name. Do NOT invent a formula.
- Gate: bash raw-port/army/gate/gate.sh raw-port/src/shaders/<Name>.ts (G1 provenance accepts
  `@shader <Name>` + `%N` IR-line citations; no @0xADDR needed for shader-derived code — the .ll IS
  the provenance, keep the .ll committed under re/shaders/).

## Two gate traps shader workers keep hitting (avoid both up front)
1. NO `/* ... */` INSIDE A `/** JSDoc */` BLOCK. An inner `/*texture0*/` or `/*fragColor*/` CLOSES the
   doc block early -> tsc syntax error (G2). When you annotate the IR signature's params, use LINE
   comments (`// %2 = texture0`) or plain parens `(texture0)`, never nested block comments.
2. THE WORD "approximate"/"approximation"/"roughly"/"heuristic" IN A COMMENT trips P3 (shortcut
   language) even when you mean fp32-narrowing. Say "fp32-narrowed" / "cast to float32" / "bit-exact
   float32 value" instead. (LLVM's literal attr `approx-func-fp-math` lives only in the .ll, not your .ts.)
Constants: `air.fast_pow.f32(x, float 0x3FE0...)` — the hex is a DOUBLE literal that AIR narrows to
f32 at the call. Decode the double, then wrap `Math.fround(<value>)` so the fp32 constant survives.

## Two gate traps EVERY shader worker hits (avoid them up front)
1. NEVER write a `/* ... */` comment INSIDE a JSDoc `/** ... */` block — the inner `*/` closes the
   doc block early and tsc (G2) fails with a cascade of syntax errors on the rest of the file. When
   annotating IR operands like `%2 /*texture0*/`, use LINE comments (`//`) or plain text, e.g.
   `// %2 = texture0`. This bites people copying the `<4 x float> %2 /*texcoord*/` shape from the IR.
2. The word "approximate"/"approximation"/"roughly"/"good enough"/"heuristic" ANYWHERE (even a
   comment) trips the P3 shortcut-language gate. fast-math IR flags are NOT approximations — describe
   them as "fast-math (reassoc/afn) — use plain JS float ops" or "fp32-narrowed", never "approximate".
   (LLVM's own attribute string `approx-func-fp-math` in the .ll is fine — it lives in the committed
   .ll, not in your .ts.)
Constants: `air.fast_pow.f32(x, <double-literal>)` — the IR spells the exponent as a DOUBLE bit
pattern but the intrinsic is .f32, so the value is fp32-narrowed at the callsite. Transcribe as
`Math.fround(<decoded double>)` and cite the raw 0x bit pattern in a `//` comment. (First landed
shader HgcColorLinearizeAlpha did exactly this: pow(alpha, Math.fround(1.9559999704360962)).)

## TWO RECURRING TS/GATE TRAPS (observed across multiple shader workers 2026-07-28)

### 1. TS 5.x Float32Array variance trap
Newer TS types a plain `Float32Array` as `Float32Array<ArrayBuffer>` and REFUSES
tuple-destructuring assignment between differently-parameterised variants
(`Float32Array<ArrayBuffer>` vs `Float32Array<ArrayBufferLike>`). If you return a
`[Float32Array, Float32Array]` tuple from a helper and destructure it, tsc (gate G2)
fails with a variance error. FIX: don't return tuples of typed arrays — pass a MUTATING
accumulator object (e.g. `const acc = {num: 0, den: 0}; step(acc, ...)`) or use plain
`number[]`. Confirmed working idiom in the bilateral-filter (blf2DImage*) shaders.

### 2. int16/uint16 cast gate idiom (P2 ungrounded-literal)
`(x: number) => Math.trunc(x) & 0xffff` TRIPS the P2 ungrounded-literal gate (the `& 0xffff`
mask reads as an invented constant). The accepted idiom — after a preceding clamp to the
type's range — is `Math.trunc(x) | 0` (or `Math.round(x)|0` when the IR has a +0.5 bias then
truncate). i.e. rely on the AIR `air.clamp` you already transcribed to bound the value, then
cast with `|0`, NOT a bitmask. Matches landed siblings bm3dnr_buf_blend8x8Weight16.ts /
bm3dnr_buf_blf2DImage3x3S16.ts. Note: the `.u.v4i16` unsigned-cast variants OMIT `air.floor`
because +0.5-bias plus the cast's implicit truncate == round-half-up over the unsigned domain.

## TWO SILENT-CORRECTNESS shader traps (guided-filter/bm3dnr workers, 2026-07-28)
These do NOT trip the gate — they produce WRONG numbers silently. Watch for them.

### air.convert.f.*.u.* is UNSIGNED int->float
`air.convert.f.v2f32.u.v2i32` (and .u. variants) treat the source int as UNSIGNED: a negative
i32 becomes a huge positive float (~4.29e9), NOT a negative. When transcribing, coerce the JS
int to unsigned FIRST: `Math.fround((x >>> 0))` for i32, or mask to the exact width for i16/i8.
The `.s.` variants are signed (normal). Get this wrong and box-sum/mean kernels silently corrupt.

### icmp ult (outer axis) vs icmp sgt (inner axis) bounds guards
Common two-axis compute-kernel guard: the OUTER axis uses `icmp ult` (unsigned) so a negative
extent wraps to a huge unsigned and "always passes"; the INNER axis uses `icmp sgt` (signed >0)
to skip. Preserve BOTH literally — don't normalize both to the same signed compare, or edge tiles
sample out of bounds / skip valid rows.

### struct-type-name reuse (Apple compiler dedup)
HeliumSenso reuses layout-compatible AIR struct types across kernels (e.g. a Pass2_I kernel's
params IR-named `..._Pass4_params`). The `!N` field metadata is authoritative — trust the field
names/offsets there, NOT the struct type name.

## GATE TRAP: P3 shortcut-language is a raw SUBSTRING match (2026-07-28)
The gate's P3 check greps for banned words (approximate/heuristic/closest/roughly/throwing) as
plain SUBSTRINGS — it does NOT understand negation. So a NEGATIVE assertion like
"No approximate or heuristic language here" STILL trips the gate, because the banned words appear
in the text. Do NOT type the banned words at all, even to say you're avoiding them. Instead write
"No shortcut language of any kind." Same applies in JSDoc/comments anywhere in the file.

## FALSE-PASS RISK: a 1-line placeholder must never count as ported (2026-07-28)
If a shader .ts ever contains ONLY a `// __PLACEHOLDER__` marker (or any 1-line stub), it must be
treated as FRESH work, NOT a completed port. Because dedup treats ANY non-empty file as "already
ported", a landed placeholder would PERMANENTLY skip that unit (silent data loss — no gate failure).
PREVENTION: before editing a shader .ts that already exists on your branch, `wc -l` it — if it's a
single marker line, do the real edit + gate + PR as normal (do not "resume" it as done).

## TOOLING NIT: shader_disasm.sh FWHINT glob fails on nested-framework shaders (2026-07-28)
`shader_disasm.sh <Name> <FW>` with an EXPLICIT framework hint returns "shader not found" for shaders
in nested frameworks (MAPlugInGUISwift, MAVectorUIKit inside EDEL.framework, etc.) — the FWHINT glob
path is stale. WORKAROUND: call `shader_disasm.sh <Name>` with NO framework arg — the no-hint path
scans all metallibs and finds them fine (confirmed for chromaVerb_vertex_untextured/MAPlugInGUISwift
and fragment_main/MAVectorUIKit). Not blocking; just drop the FW arg. (Script fix deferred to a
low-load window — don't edit shared tooling while the swarm is live.)

## P3 CORRECTION — the ACTUAL provenance_gate.py regex (2026-07-28, verified against source)
Earlier notes here overstated/mis-stated the P3 rule. GROUND TRUTH from raw-port/army/gate/provenance_gate.py:
  BANNED_LANG = \b(approximate|approximation|roughly|good enough|guesstimate|heuristic|hack|fudge)\b  (case-insens)
  NEGATED (whitelists the line) = \b(do not|don't|never|no silent|not|without)\b
- ONLY those 8 words are banned. "shortcut", "closest", "throwing", "estimate" are NOT banned.
- A banned word is SAFE on a line that ALSO contains a NEGATED token. So "does NOT approximate" and
  "never uses a heuristic" PASS. But BARE "no" is NOT a negation token → "no approximation" TRIPS.
- Practical rule: if you must disclaim, write "does not approximate"/"never …", NOT "no approximation".
  Simplest: avoid the 8 words entirely; "faithful fp32 transcription" / "fp32-narrowed" always passes.
- P4 (separate): a line with "throw" AND (not yet|pending|unimpl|transcrib) needs an @0x addr on the
  SAME line. P5 bans Math.random, Date.now()-arithmetic, and empty catch{}.
(Supersedes the earlier "raw substring / negative assertions always trip / say 'No shortcut language'"
notes — those were over-cautious/inaccurate. The over-cautious advice was still SAFE, just wrong on mechanism.)


## HOW TO PORT A BARRIER SHADER using harness/ThreadgroupReduction (2026-07-28)
Landed 2026-07-28 (SHA aa92f83): `raw-port/src/harness/ThreadgroupReduction.ts` + worked
example `raw-port/src/shaders/soMOMotionEstimation_numPoints.ts`. This unblocks the whole
>500-line barrier shader family that queue-pull workers were previously skipping
(bm3dnr_buf haar8x8/mcBuf/noiseStats/variance, soMOMotionEstimation reduction*/moment/
numWtSum, soOFlowEstimator estimateCLG* — ~30 shaders).

RECIPE (for any shader whose .ll contains `air.wg.barrier` + `addrspace(3)`):

1. **Read the AIR kernel signature** from `!air.kernel !14` at the bottom of the .ll. Note which
   args are `air.threads_per_threadgroup` (`gSize`), `air.thread_position_in_threadgroup` (`lid`),
   `air.thread_position_in_grid` (`gid`), `addrspace(3)*` (threadgroup shared mem), and
   `addrspace(1)*` (global buffers). The metadata operand `!N` field names/offsets are the ground
   truth — use them, not the C++ struct-type name (Apple's compiler dedups layout-compatible types).

2. **Split the IR at every `air.wg.barrier(i32 2, i32 1)` call**. Each barrier is a PHASE BOUNDARY.
   K barriers → K+1 phase functions. Number the phases 0..K in IR order.

3. **Write ONE phase function per barrier region**, each of type
   `PhaseFn<TShared> = (idx: ThreadIndex, sharedMem: TShared) => void`. Inside:
   - Pull `lid.x/lid.y/gSize.x/gSize.y` off `idx` — these ARE the AIR intrinsics.
   - Read/write threadgroup memory as literal indexing: AIR's
     `getelementptr i32, i32 addrspace(3)* %5, i64 %lid.x` becomes `sharedMem[lid.x]`.
   - Reads AFTER the barrier see writes that HAPPENED IN EARLIER PHASES — the harness's
     "run all threads' phase-N before ANY thread's phase-(N+1)" loop IS air.wg.barrier.
   - Do NOT invent a reduction stride — transcribe the exact loop shape (`+1`, `+gSize.x`,
     tree-halving, whatever the IR does).

4. **Pick the shared-mem typed array to match the AIR element type**:
   - `i32 addrspace(3)*` → `Int32Array`
   - `float addrspace(3)*` → `Float32Array` (use `Math.fround` on every fp32 store)
   - `i16 addrspace(3)*` → `Int16Array`
   - Etc. Element type is stated on the `addrspace(3)` GEP in the IR.

5. **Wrap it with a driver** that calls `dispatchThreadgroup(gSize, sharedMem, [phase0, phase1, ...])`.
   For multi-tile kernels (e.g. bm3dnr's per-16x16-tile stats), use `dispatchGrid(gridSize, gSize,
   makeShared, phases)` instead — it gives each threadgroup a fresh shared-mem buffer, matching Metal.

6. **Header + gate**: the shader file's FIRST line must be
   `// Faithful transcription @0xADDR — @shader <Name> (<FW>)` (address from the .ll's first line
   `0xADDR -- <Sym>:`). Cite %IR line numbers for each block. Copy the .ll into
   `raw-port/re/shaders/` if it's not already there. `bash raw-port/army/gate/gate.sh <files>`
   → gate PASS. Then commit + `bash raw-port/army/tools/pr_submit.sh <Name>` (opens a PR; a reviewer
   gates and merges).

CAVEATS specific to barrier shaders:
- `air.convert.f.f32.s.i32` is SIGNED (normal). `.u.` is UNSIGNED — coerce with `>>>0` first.
- `air.sample_texture_2d.u.v4i32` returns `{<4 x i32>, i8}` (rgba + residency); model the callback
  as `(uv) => [r,g,b,a]` and ignore the residency byte unless the IR extracts it.
- Sample coord bias `+ 0.5` on integer-derived uv (`float(x) + 0.5`) is pixel-CENTER — this is the
  standard AIR idiom for pixel-exact texel fetches, not a heuristic.
- The AIR barrier args `(i32 2, i32 1)` are (scope=threadgroup=2, flags=mem_threadgroup=1). See
  `AIR_WG_BARRIER_SCOPE_THREADGROUP` / `AIR_WG_BARRIER_FLAGS_THREADGROUP` exports for the sentinels.
- `lid.y` may be unused in 1-D reductions (numPoints, moment, numWtSum) — the shader dispatches
  with `gSize.y == 1` and only `lid.x` matters. Just don't read `idx.lid[1]` if the IR doesn't.
