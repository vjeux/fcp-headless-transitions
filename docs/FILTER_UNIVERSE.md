# FCP / Motion Filter Universe — Phase-1 RE map
The objective is to reverse-engineer EVERY filter in the FCP/Motion engine, not only the
~20 primitives exercised by the 65 shipping transitions. This document is the definitive
inventory, built from two ground-truth sources:

1. **FCP's `Filters.bundle` Mach-O** (`.../InternalFiltersXPC.pluginkit/.../Filters.bundle/
   Contents/MacOS/Filters`) — the binary that implements every built-in filter. It embeds
   **246 `Hgc*` fragment shaders** as verbatim C-strings in `__TEXT,__cstring`
   (extract with `tools/re/extract_shader.py <name>`), plus ~495 `PAE*` Obj-C effect classes.
2. **A 1434-file third-party template corpus** (`~/motr-collection`) whose `.motr/.moti/
   .motn/.moef` files reference **42 distinct `PAE*` filter UUIDs** with real parameter
   values — the actual parameter space these filters are driven across in the wild
   (`~/motr-collection/pae_filter_catalog.json`).

Verbatim shader sources for the corpus-discovered filters are checked in under
`engine/src/compositor/filters/evidence/shaders/*.metal` (ground-truth per-pixel algorithms).

## Legend
- ✅ implemented in the TS engine (`compositor/filters/`)
- 📄 shader extracted + documented, NOT yet implemented (Phase-1 done, Phase-2 open)
- 🔬 corpus-exercised (appears in real templates → concrete Phase-2 verification target)

> **Full per-parameter reference:** [`docs/filters-corpus/`](filters-corpus/README.md) documents
> every filter UUID seen in the (now ~5,300-file) corpus — **141 distinct filters, 25 implemented** —
> with each parameter's inferred type, default, empirical value range, and keyframe frequency.
> This section is the RE/shader map; that directory is the exhaustive parameter surface.

## Corpus filters — the concrete "every filter" work list

| PAE class | UUID | corpus files | shader | engine |
|---|---|---|---|---|
| PAEDirectionalBlur | 2E7B1340-5D4F-4015-8AA0-53BEB9F2CA52 | 162 | — | ✅ |
| PAEFlop | 2FF8887B-E673-4727-9601-1B3353531C10 | 72 | — | ✅ |
| PAETint | 717D6E01-83F4-4A4B-AF92-42AABA4B176C | 55 | HgcTint | ✅ |
| PAEContrast | B13B57AC-811B-4A24-BB5A-2167A3C66F5F | 40 | — | 📄 |
| PAEGaussianBlur | E472D646-2C92-464E-98A1-91CF8F162AD8 | 35 | — | ✅ |
| PAEBrightness | 2E4DBB0A-A950-4896-BC2D-A5B0CFF7FAC6 | 29 | — | ✅ |
| PAELevels | 2B221FA1-08A2-416E-998C-D7559E5509B5 | 26 | HgcLevels | ✅ |
| PAEPoke | 70471B0A-5D9D-4699-AEEE-CCFC84045B4B | 14 | HgcPoke | 📄 |
| PAEGradientColorize | FB917FD2-68DF-4BE7-A313-82124F6DE776 | 12 | HgcGradientColorize | 📄 |
| PAETarget | 220963F2-8E3F-4642-A080-C064CA0B487E | 12 | HgcTarget | 📄 |
| PAEVignette | EB96FF9E-5863-4770-B7B5-65CB9BBF8E3B | 11 | HgcVignette | ✅ verified 32-44dB |
| PAEHSVAdjust | D23AF030-B0BF-44DF-B622-7C9EA0DF5744 | 10 | HgcHSVAdjust | ✅ |
| PAEAddNoise | C423A28F-C016-4133-B120-22FF2E9A7862 | 8 | HgcAddNoise | 📄 |
| PAEColorize | D995BBCF-F766-4950-89D5-7A4828CD9B6F | 8 | HgcColorize | ✅ |
| PAEDefocus | 0F3B36EF-B955-4471-87C6-9EE2A74AFE5E | 4 | HgcConvolvePass7tapDefocus | 📄 |
| PAEBadTV | 32AB5EE1-BACB-4B81-B44E-6D1E643C8D00 | 3 | HgcBadTV | ✅ |
| PAELightRays | B074E0A5-BE6F-43B4-898A-AB0A44189CD9 | 3 | — | 📄 |
| PAEBadFilm | 9B5C17D9-1AC3-4B04-B8F3-59C1420963BF | 3 | HgcBadFilm | 📄 |
| PAELumaKeyer | 7E9178C5-7B0F-4B86-884D-FE79F568B6CE | 3 | HgcLumaKeyer | ✅ |
| PAEThreshold | 96AFC322-287E-4014-9EFD-763CD9813E17 | 2 | HgcThreshold | ✅ verified (split=Thr; non-edge 33dB) |
| PAEFisheye | C1278154-B061-453F-8BDE-9F70AB2E6066 | 2 | HgcFisheye | ✅ verified (aniso W/H, 34-36dB) |
| PAESimpleBorder | 8777A5DD-CDDA-4707-8454-D648943210D9 | 2 | — | 📄 |
| PAEHighPass | 44CB7A9A-4E16-4B32-9567-C1EAD1C0693A | 2 | HgcHighPass | 📄 |
| PAECICISharpenLuminance | 1386B4FC-1BBF-11D9-94CD-000A95DF1816 | 2 | — | 📄 |
| PAECICIMotionBlur | 9734F854-1BBF-11D9-94CD-000A95DF1816 | 2 | — | 📄 |
| PAEColorBalance | E9B93275-A56D-4012-BEF6-5DD59A74B344 | 2 | — | 📄 |
| PAEDazzle | E92A99A6-A2E5-44A0-B29C-80674F4003D0 | 1 | HgcScaleAndAddClampDazzle | 📄 |
| PAEBloom | 5599C557-CDC0-4112-B2C4-355E9A1A902E | 1 | HgcBloomThreshold | ✅ |
| PAEAura | 2E01612E-7A80-42B5-8767-9F3E58679DDD | 1 | HgcAura | 📄 |
| PAEKaleidaTile | 7438BC75-716C-4D49-9613-7EE2834B9B7B | 1 | HgcKaleidaTile | 📄 |
| PAEGradientBlur | 7C7405BB-1B00-4811-A507-CB9F619CA522 | 1 | HgcGradientBlur2 | 📄 |
| PAESphere | 1E78D3E3-63AC-46E3-99F4-014129B9ECCC | 1 | HgcSphere | 📄 |
| PAEUnderwater | 9FA1F483-1E09-4DD0-870F-C32777D7F1B0 | 1 | HgcUnderwaterFreqSynth | ✅ |
| PAEMinMax | D2342006-51C4-4439-8E89-E970F135E21C | 1 | — | ✅ |
| PAEPixellate | 5E7CA164-3AAF-4C70-A377-567E5796528A | 1 | HgcPixellate | ✅ verified (block=Scale, 28-32dB) |
| PAEInsectEye | 62A7EF56-178A-4D81-AF6A-C1B77A7D9519 | 1 | HgcInsectEye | 📄 |
| PAECircleScreen | 46396CAD-950B-4EA3-92F3-0CC54DF53AC9 | 1 | — | 📄 |
| PAEBumpMap | 1E6F3535-CAD6-4F4A-8EFE-24C402488000 | 1 | HgcBumpMap | 📄 |
| PAEZoomBlur | 11C0E095-5F4F-46E2-AE28-F56ED7D38D7E | 1 | HgcZoomBlur | ✅ |
| PAEScrub | 3A359CB1-0572-48AD-8623-4D5A681466F5 | 1 | — | 📄 |
| PAEColorReduce | 3168D40C-AF34-401F-81DA-CB50EC5DD5D0 | 1 | HgcColorReduce | 📄 |
| PAELineScreen | 57174A04-8434-4179-A8EB-66C88B63F308 | 1 | HgcLineScreen | 📄 |

## All embedded Hgc fragment shaders (the full per-pixel algorithm set)

```
  HgcACC                        HgcAddNoise                   HgcAddNoiseNormal             HgcAdditiveTransparentBlend
  HgcAlphaKeyer                 HgcAlphaMult                  HgcAnalyzeGrain               HgcAura
  HgcBadFilm                    HgcBadFilmGrain               HgcBadTV                      HgcBadTVNoise
  HgcBevel                      HgcBlackHole                  HgcBlendAlpha                 HgcBlendOpAdd
  HgcBloomThreshold             HgcBlueGreenScreenCandidate   HgcBlueScreen                 HgcBroadcastSafe
  HgcBroadcastSafeReduceIntensity  HgcBulge                      HgcBumpMap                    HgcCIGaussianGradient
  HgcCausticsSoften             HgcCellular                   HgcChannelBalance             HgcChannelBlur
  HgcChannelBlurNoPremult       HgcChannelMixer               HgcChannelSwap                HgcCheckerboard
  HgcCircleBlur2                HgcCircles                    HgcCircularScreen             HgcClouds
  HgcColor4w                    HgcColorAndGradientStroke     HgcColorCurves                HgcColorEmboss
  HgcColorKey                   HgcColorReduce                HgcColorSOP                   HgcColorize
  HgcConcentricCircles          HgcConcentricCirclesGradient  HgcConcentricPolkaDots        HgcConcentricPolkaPolygons
  HgcConcentricPolkaStar        HgcConcentricPolygons         HgcConcentricPolygonsGradient  HgcConcentricSquareChecker
  HgcConcentricTriangleChecker  HgcConvolvePass5tapPoint      HgcConvolvePass7tapDefocus    HgcConvolvePass8tapIndent
  HgcConvolvePass8tapPoint      HgcConvolvePassMatteMagic     HgcConvolvePassMatteMagicYPass  HgcCopyAlpha
  HgcCrossDissolveHighlights    HgcCrossDissolveShadows       HgcCrossDissolveSubtractive   HgcCrystallize
  HgcDeinterlaceBlend           HgcDeinterlaceDupe            HgcDeinterlaceInterp          HgcDesaturate
  HgcDiffScreen                 HgcDiscWarp                   HgcDisplace                   HgcDissolve
  HgcDroplet                    HgcEchoBlend                  HgcEchoScaleAndAdd            HgcEdges
  HgcEqualize                   HgcEquirectToSinusoidal       HgcExtrudeGradient            HgcFTChromaKeyer
  HgcFTFilmGrain                HgcFillColor                  HgcFisheye                    HgcFunHouse
  HgcGamma                      HgcGlassBlock                 HgcGlassDistort               HgcGloom
  HgcGlow                       HgcGlowCombineFx              HgcGradientBlur2              HgcGradientBorderWipe
  HgcGradientColorize           HgcGradientFeatherWipe        HgcGradientLinear             HgcGradientNoirWipe
  HgcGradientRadial             HgcGradientWipe               HgcGradientWipeBandGenerator  HgcGradientWipeCenterGenerator
  HgcGradientWipeCheckerGenerator  HgcGradientWipeChevronGenerator  HgcGradientWipeClockGenerator  HgcGradientWipeClockGeneratorNoir
  HgcGradientWipeEdgeGenerator  HgcGradientWipeGenerator      HgcGradientWipeInsetGenerator  HgcGradientWipePointGenerator
  HgcGreenScreen                HgcGrid                       HgcHDRCurveShader             HgcHSVAdjust
  HgcHalftone                   HgcHatchedScreen              HgcHighPass                   HgcIndent
  HgcInsectEye                  HgcInsectEyeBorder            HgcInvert                     HgcInvertAlpha
  HgcIrisPointGenerator         HgcKaleidaTile                HgcLensFlare                  HgcLensFlareFilter
  HgcLevels                     HgcLine                       HgcLineArt                    HgcLineArtThreshold
  HgcLineScreen                 HgcLocateScreen               HgcLumaKey                    HgcLumaKeyer
  HgcMangaLines                 HgcMangaLinesLinear           HgcMaskAlpha                  HgcMatteChoker
  HgcMirror                     HgcNegative                   HgcNoise                      HgcNoiseDissolve
  HgcOffset                     HgcOneColorRay                HgcOpArt1                     HgcOpArt2
  HgcOpArt3                     HgcOuterGlowColorize          HgcOuterGlowLumaWeight        HgcOutlineGradientStroke
  HgcOvalIrisBorder             HgcOvalIrisFeather            HgcOvalIrisNoir               HgcOverdrive2
  HgcOverlappingCircles         HgcPageCurl                   HgcPageCurlBackground         HgcPageCurlForeground
  HgcParallelogramTile          HgcPerspectiveTile            HgcPixellate                  HgcPlotScanline
  HgcPoke                       HgcPolarToRect                HgcPostKeyer                  HgcPosterize
  HgcPremultToStraight          HgcPrimatteBackground         HgcPrimatteForeground         HgcPrimatteMatte
  HgcPrimatteProcessedForeground  HgcPrism                      HgcRadialBars                 HgcRadialBarsModern
  HgcRadialMask                 HgcRandomTile                 HgcReconstructDT              HgcRectToPolar
  HgcReduceBanding              HgcRefraction                 HgcRefractionHeightMap        HgcRelief
  HgcRingLens                   HgcRippleTransition           HgcSatCurves                  HgcSaturation
  HgcScaleAndAddClampDazzle     HgcScaleBy2                   HgcScrape                     HgcSeigaiha
  HgcSepia                      HgcShapeCheckerboard          HgcSharpen                    HgcShippo
  HgcShrinkAndFeatherMatteMagic  HgcSimpleAdd                  HgcSinusoidalToEquirect       HgcSlicedScale
  HgcSlicedTile                 HgcSlitScan                   HgcSlitScanGlow               HgcSlitTunnel
  HgcSoftGradient               HgcSolidColor                 HgcSphere                     HgcSpillRemoval
  HgcSpillRemovalDarkEdges      HgcSpillSuppressor            HgcSpirals                    HgcSpiralsExponential
  HgcSpiralsExponentialGradient  HgcSpiralsGradient            HgcStar                       HgcStarIris
  HgcStarburst                  HgcStretchBy2                 HgcStripes                    HgcStripesFilter
  HgcSunburst                   HgcTarget                     HgcTextureScreen              HgcThreshold
  HgcThresholdNoPremult         HgcTint                       HgcTrailsMaxBlend             HgcTrailsMinBlend
  HgcTriangleTile               HgcTriangularCheckerboard     HgcTruchetTiles               HgcTwirl
  HgcTwoColorRay                HgcUnderwaterFreqSynth        HgcUnderwaterRefractV2        HgcUnsharpMask
  HgcVariableBlurIntensity      HgcVignette                   HgcWave                       HgcWavyScreen
  HgcWideScreen                 HgcYIQAdjust                  HgcYUVRGBAdjust               HgcZoomBlur
  HgciMovieFade                 HgciMovieGradient             HgciOSKaleidoscope            HgciOSLightTunnel
  HgciOSStretch                 HgciOSTwirl
```
