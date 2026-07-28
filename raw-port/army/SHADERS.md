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
