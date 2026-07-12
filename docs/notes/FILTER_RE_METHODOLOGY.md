# Filter RE methodology — the ONE rule that prevents the slow back-and-forth

## The failure mode (diagnosed 2026-07-12)
The first pass on the 8 new filters + Radial/Zoom was slow and buggy because it
**reverse-engineered the per-pixel SHADER but treated the CPU-computed constants as
free unknowns and GRID-SEARCHED them against headless output.** That is curve-fitting,
not translation. Symptoms that prove it:
  * The SAME Helium primitive (HGaussianBlur) got THREE different fitted kernels:
    sigma=Amount/6.67 (directional), sigma=arcPx/6.0 (radial), sigma=r/3 (gaussian).
    One primitive cannot have three kernels — each fit was silently absorbing a
    conversion factor that was never decoded.
  * Zoom only reached psnr ~24 with a hand-invented "scale-average" model, because the
    real magnitude mapping was fitted, not read.
  * Multiple ESM/require bugs + Mix-handling misses slipped through because the agent
    verified via a shim harness, not the real engine path.

## The rule: DECODE the constants, do not FIT them. Headless = verification only.
FCP's per-pixel math lives in the embedded Metal shader (extract_shader.py). But the
shader reads `hg_Params[i]` that are computed CPU-side. Those CPU formulas are ALSO in
the binary as NAMED, decompilable functions. Do not guess them.

For blur, the shared primitives are (Helium.framework, arm64 — all named symbols):
  * `HGLinearFilter::gaussian(x, mean, sigma)` @0x1040ec = the kernel weight:
      (1/sigma) * exp(-0.5*((x-mean)/sigma)^2) * 0.39894228     (0.39894228 = 1/sqrt(2pi))
    i.e. the STANDARD normalized Gaussian PDF. No mystery divisor.
  * `HGLinearFilter::gauss(x, ., halfwidth)` @0x104138 = exp(-0.5*(4x)*(4x)) variant.
  * `HGDefinition::CIToHGBlurRadius(f)` @0xfc724 = f * 3.0  (UI/CI radius -> internal).
  * `HGPrefilterUtils::GetPrefilterRadius(kernelType, sigma, scale)` @0xff558:
      r = ceil( (log10(sigma)/(-0.30103)) * kernelCoeff[kernelType] * scale )
      (-0.30103 = -log10(2), so log10(sigma)/-0.30103 = -log2(sigma); this sizes the
      DECIMATION level, confirming decimate->convolve->upsample.)
  * `HGConvolution::PopulateCoeffInputForKernel` = builds the tap-weight buffer.
  * `HGBlurGroup::setBlurValues` / `HGLinearFilter2D` = the separable kernel assembly.
So: recover how each filter's UI param (Amount/Angle/Radius) maps to `sigma`, then the
kernel is EXACTLY HGLinearFilter::gaussian. Every blur filter (Gaussian, Directional,
Radial, Zoom, Bloom, Glow) shares these — decode ONCE, translate all.

## Loop (per filter)
1. extract_shader.py <Hgc...>  -> the per-pixel math (verbatim, into the .ts comment).
2. otool -arch arm64 -tV on -[PAE<Name> canThrowRenderOutput] AND frameSetup: decode
   EVERY getFloatValue/getIntValue -> SetParameter chain into the exact hg_Params[i]
   formula. Chase called helpers (HG*::init, ::gaussian, CIToHGBlurRadius, ...) into
   Helium/ProAppsFxSupport until NO constant is a guess. Read __const doubles by
   mapping vmaddr->file offset via `otool -l` segment/section tables.
3. Translate directly to TS. registerFilter. `cd engine && npx tsc --noEmit` == 0.
4. VERIFY (do not fit) against real headless: tools/re/filter_verify.py across the
   param space. A correct translation lands psnr >= ~35 immediately. If it's low,
   a CONSTANT IS STILL GUESSED — go back to step 2, don't grid-search.
5. Run the engine render path (not just the shim) before claiming done: the filter
   must honor rig overrides, host Mix (parmId 10001), and ES-module imports.
6. Gate: fct gate engine <affected slugs> — 0 regressions before commit+push.

## Hard-won specifics (don't re-learn)
  * `require()` is FORBIDDEN (engine is ESM via tsx) — use top-level `import`. The
    _filter_apply shim tolerates require(); the real engine throws. Test the real path.
  * Host Mix (parmId 10001) blends filter output toward input; Mix=0 => passthrough.
    A filter that ignores Mix will over-apply (Lights/Static sets BadTV Mix=0).
  * <enabled>0</enabled> filters are NOT applied by FCP (parser now skips them).
  * 1854x1042 vs 1920x1080: start.png is 1854 but FCP renders the probe at 1920, so a
    geometry filter's probe PSNR has a uniform ~3.6% conform floor. NOT an algorithm
    error — verify at matched res / on the real transition, which renders at project size.
  * Some plugins render BLACK headless (reorient360, Underwater t>1.0) — no GUI GT; a
    phase-divergent approximation is WORSE than passthrough. Document the ceiling; don't
    ship a fit that regresses the gate.
