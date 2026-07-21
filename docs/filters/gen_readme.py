import json, re, math

PAYLOAD = "/Users/vjeux/motr-collection/doc_payload.json"
KBFILE = "/tmp/filterdocs/kb.json"
OUT = "/Users/vjeux/random/final-cut-pro-transitions/docs/filters/README.md"

d = json.load(open(PAYLOAD))
kb = json.load(open(KBFILE))
meta = d["meta"]
filters = sorted(d["filters"].values(), key=lambda x: x["files"], reverse=True)
top = filters[:50]

INTERNAL_NAMES = {
    "Chroma","Graph","Histogram","OSC","DefaultSoftness","Strength","Spill Level",
    "Chroma Rolloff","Chroma Erode","Fix Video","MinGreen","MaxGreen","GreenChroma",
    "MinBlue","MaxBlue","BlueChroma","Spill Contrast","Tint","Saturation","Light Wrap",
    "Luma Erode","KeyerIsInitialized","Layer","Controls","IOS Compatability Behavior",
}

def is_localized(name):
    try:
        name.encode("ascii"); return False
    except UnicodeEncodeError:
        return True

def creative_count(f):
    rp = f["real_params"]; pae = f["pae"]
    kbp = set(kb.get(pae, {}).get("params", {}).keys())
    maxseen = max((pd.get("seen", 0) for pd in rp.values()), default=1) or 1
    n = 0
    for name, pd in rp.items():
        if name in kbp:
            n += 1; continue
        if is_localized(name): continue
        if "::" in name or name.strip() in ("?", "") or name in INTERNAL_NAMES: continue
        seen = pd.get("seen", 0)
        if seen and seen < 0.10 * maxseen: continue
        n += 1
    return n

def esc(s): return str(s).replace("|","\\|")
def slug(pae):
    s = pae.lower().replace("/","-").replace("::","-")
    s = re.sub(r"[^a-z0-9]+","-",s); s = re.sub(r"-+","-",s).strip("-")
    return s

L = []
L.append("# FCP / Motion Filter Reference (Top 50 by corpus usage)")
L.append("")
L.append("This directory documents the **50 most-used Apple Motion / Final Cut Pro filters** found "
 "across the third-party template corpus (`~/motr-collection`), one Markdown file per filter. Each page "
 "explains **what the filter actually does** to the image, lists **only its creative parameters** (with "
 "human descriptions, correct types, and the value range observed in the wild), notes the FxPlug plumbing "
 "parameters separately, and records the reverse-engineering / implementation status. Filter behavior is "
 "distilled from three ground-truth sources where available: this engine's decoded TS filter modules "
 "(`engine/src/compositor/filters/*.ts`), the verbatim `Hgc*` Metal shaders checked in under "
 "`evidence/shaders/`, and the RE write-ups in `evidence/*.md` — falling back to documented Apple Motion "
 "behavior (with an explicit *unverified* flag) when no in-repo evidence exists. See "
 "[`../FILTER_UNIVERSE.md`](../FILTER_UNIVERSE.md) for the full inventory and status legend.")
L.append("")
L.append(f"*Built from `doc_payload.json` ({meta['files_parsed']} template files parsed). "
 "Parameter types apply Motion-domain corrections over the raw sampled types: `Mix`, `Amount` (0–1), "
 "`Opacity`, `Intensity`, `Saturation`, `Softness` are continuous **floats** (never bools); `Angle` / "
 "`Twirl` / `Rotation` are **radians**; `Center` / `Position` are **point2D** in Motion's normalized "
 "frame space where (0.5, 0.5) is the frame center.*")
L.append("")
L.append("## Index")
L.append("")
L.append("| # | Filter | PAE class | Files | Creative params | Status |")
L.append("|---|---|---|---|---|---|")
for i, f in enumerate(top, 1):
    st = "✅ implemented" if f["implemented"] else "🔬 not impl"
    if not f["implemented"] and f.get("shader"):
        st = "📄 shader only"
    link = f"[{esc(f['pae'])}]({slug(f['pae'])}.md)"
    L.append(f"| {i} | {link} | `{esc(f['pae'])}` | {f['files']} | {creative_count(f)} | {st} |")
L.append("")
L.append("**Legend:** ✅ implemented in the TS engine · 📄 verbatim shader checked in, not yet implemented · "
 "🔬 corpus-exercised, no shader extracted yet.")
L.append("")
L.append("## FxPlug plumbing parameters")
L.append("")
L.append("Every Motion filter carries a set of **host / FxPlug boilerplate parameters** that are *not* "
 "creative controls — they are plumbing added by the shared FxPlug base class and the Motion host. The "
 "per-filter pages list which ones are present but do not describe them individually; here is the shared "
 "explanation once:")
L.append("")
pd = {
 "Mix": "Present on almost every filter as a *host-level* wet/dry blend (`out = lerp(input, filtered, Mix)`), 0–1 continuous. It is documented as a creative param on the filter pages (it genuinely controls opacity of the effect), but it is applied by the host, not the filter shader.",
 "Flip": "Whether the image is Y-flipped in the current render context (Motion's coordinate handedness handshake). Filters read it to keep angles/directions consistent; templates leave it at the context default.",
 "Input Points": "On-screen-control input-point handshake — the OSC anchor points the host passes in. Housekeeping, not a visual knob.",
 "Publish OSC": "Whether the filter's on-screen control is published/visible in the inspector. UI-only.",
 "OSC Center": "The on-screen-control center handle position — a UI affordance mirroring the filter's Center param, not an independent control.",
 "Crop": "Whether the filtered output is cropped to the working rectangle (vs allowed to bleed past the DOD).",
 "Prescale Input": "Whether the host pre-scales the input image before the filter runs (a performance/quality plumbing flag).",
 "360° Aware": "Whether the filter runs its equirectangular/360-video-aware code path (seam wrapping) rather than the flat path.",
 "HDR In Rec. 709": "Working-space flag: interpret the input as Rec.709 HDR when computing the effect. Color-management plumbing.",
 "Clip to Black": "Clamp/premultiply behavior — clip out-of-range values against black.",
 "Clip to White": "Clamp/premultiply behavior — clip out-of-range values against white.",
}
L.append("| Parameter | What it is |")
L.append("|---|---|")
for name in meta.get("plumbing", []):
    desc = pd.get(name, "Standard FxPlug host plumbing (not a creative control).")
    L.append(f"| `{esc(name)}` | {desc} |")
L.append("")
L.append("> When a filter page's *FxPlug plumbing* footer lists parameters like `Flip`, `Input Points`, "
 "`Publish OSC`, `Crop`, `360° Aware`, etc., those are the boilerplate above — safe to ignore when "
 "reimplementing the creative behavior of the filter.")
L.append("")
open(OUT,"w").write("\n".join(L))
print("README written")
