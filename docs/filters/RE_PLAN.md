# Filter Reverse-Engineering Plan & Tracker

Goal: for every one of the 141 corpus filters, write the **actual decompiled code** — verbatim
from the user's licensed Final Cut Pro install — into each filter's doc, so the TS engine
implementation can be a faithful translation of Apple's real algorithm rather than a guess.

**The rule that changed (2026-07-22):** earlier passes wrote *my own paraphrased pseudocode* under
"Algorithm (decoded)" / "Inferred sketch". That was rejected: paraphrase can be subtly (or badly)
wrong, and inventing an algorithm defeats the purpose. Every filter doc now embeds the **verbatim
decompiled code** (Metal shader source + ARM64 disassembly), inline, with the exact command to
regenerate it. Nothing is paraphrased or invented.

## Sources (all from the user's licensed FCP install, for building an interoperable renderer)
- **Embedded Metal shaders** — `tools/re/extract_shader.py Hgc<Name>` prints the verbatim per-pixel
  fragment source FCP embeds as a C-string in the Filters (and Helium) Mach-O. 320 `Hgc*` shaders
  discoverable across the two binaries; 128 checked in under
  `engine/src/compositor/filters/evidence/shaders/<Hgc*>.metal`.
- **PAE class disasm** — `tools/re/disasm_pae.py PAE<Name>` (wraps `otool -arch arm64 -tV`) prints
  the verbatim machine code of `-[PAE<Name> canThrowRenderOutput:...]` / `frameSetup:`. This is the
  CPU code that reads each UI parameter (`getFloatValue:fromParm:`, `getRedValue:…:fromParm:`,
  `mixAmountAtTime:`) and pushes it into the shader's `hg_Params[]` slots via the primitive's
  `SetParameter` vtable call.
- **Helium primitives** — many filters have no dedicated `Hgc*` shader and instead construct a
  compiled C++ image node (`HPrism`, `HTwirl`, `HDiscWarp`, `HGaussianBlur`, `HGGamma`, …). The
  PAE→primitive→shader chain is traced in `tools/re/filter_binding.json`; the primitive's own math
  lives in `Helium.framework`.

## What each doc's "Decompiled code (ground truth)" section contains
- **Shader-backed (103 filters):** the verbatim `Hgc*` Metal source (per-pixel math), the verbatim
  disassembly of the CPU wiring window, and a **parameter→shader-slot mapping decoded by dataflow**
  from that disassembly (which `fromParm:` getter feeds each `SetParameter(slot K)`) — not guessed.
- **Helium/CPU-only (25 filters):** no dedicated shader; the verbatim disassembly of the render
  method plus the Helium primitive(s) it constructs, with the command to disassemble the primitive.
- **Non-RE-able (13 filters):** third-party plug-ins (Gyroflow, CorridorKey), `· KF` template
  presets, CIFilter wrappers (Motion Blur, Custom LUT, Color Wheels), on-screen-control helpers,
  and one dangling parser record — each honestly documented as having no Apple `Hgc*` code to
  decompile, with a pointer to where its real code lives.

## Categories (from `tools/re/filter_binding.json`)
- **shader (76):** PAE class constructs a dedicated `Hgc*` shader directly.
- **helium_shader (27):** PAE class drives a Helium primitive that constructs a named `Hgc*` shader
  (Prism→HgcPrism, Twirl→HgcTwirl, DiscWarp→HgcDiscWarp, Gamma→HgcGamma, …).
- **helium_cpu (25):** PAE class drives a Helium primitive with no name-matching shader (blurs,
  color-matrix ops, warps whose math is in the primitive binary).
- **non-RE-able (13):** preset(5) / cifilter(3) / 3rdparty(2) / osc(1) / dangling(1) / structural(1).

## Tools
- `tools/re/extract_shader.py Hgc<Name>` — verbatim Metal shader source (Filters + Helium binaries).
- `tools/re/disasm_pae.py PAE<Name>` — verbatim render-method disassembly; `--wiring` for the
  decoded getter/SetParameter event stream.
- `tools/re/gen_decompiled_docs.py` — regenerates the "Decompiled code (ground truth)" section of
  all 141 docs from `filter_binding.json` + the two tools above. Idempotent.
- `tools/re/filter_binding.json` — the authoritative PAE-class / shader / primitive binding for all
  141 filters (itself produced from the disassembly).

## Regenerate everything
```
venv/bin/python3 tools/re/gen_decompiled_docs.py
```
