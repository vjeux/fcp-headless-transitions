# Frontier surfaced by port-PCColor (commit ef86ed5) — 2026-07-27
Keystone blocker (unlocks ~30 stubbed PCColor methods): 
  - transformColor<PCColor::ColorComponents>  @ProCore 0x799a0   [colorspace conversion core]
Lifetime primitives (needed broadly):
  - PCCFRef<CGColorSpace*>       @ProCore ~0x77b40 (retain/release/~) — 16B CFType wrapper
  - PCColorSpaceHandle           (ctor from PCCFRef<CGColorSpace*>)
Support:
  - PCGetCachedExtendedRangeColorSpace ; allocDefaultColorSpace  (default/extended-range cs)
  - PCToneMapMethod ; PCDynamicRange   (HDR getRGBA/setRGBA paths)
  - PCXColor  (separate color class, layout unknown)
Next-wave priority: transformColor (highest unlock), then PCCFRef (lifetime), then PCColorSpaceHandle.
