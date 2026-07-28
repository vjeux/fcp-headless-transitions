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
