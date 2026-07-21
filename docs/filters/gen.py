import json, os, re, math

PAYLOAD = "/Users/vjeux/motr-collection/doc_payload.json"
KBFILE = "/tmp/filterdocs/kb.json"
OUTDIR = "/Users/vjeux/random/final-cut-pro-transitions/docs/filters"

d = json.load(open(PAYLOAD))
kb = json.load(open(KBFILE))
filters = sorted(d["filters"].values(), key=lambda x: x["files"], reverse=True)
top = filters[:50]

def esc(s):
    return str(s).replace("|", "\\|")

def slug(pae):
    s = pae.lower()
    s = s.replace("/", "-").replace("::", "-")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s

def fmt_num(v):
    if v is None: return "-"
    try:
        f = float(v)
        if f == int(f): return str(int(f))
        # radians hint: show pi multiples cleanly-ish
        return f"{f:.4g}"
    except (ValueError, TypeError):
        return esc(v)

def fmt_default(v):
    if v is None: return "-"
    try:
        f = float(v)
        if abs(f - math.pi) < 1e-6: return "pi (3.1416)"
        if abs(f - math.pi/4) < 1e-6: return "pi/4 (0.7854)"
        if f == int(f): return str(int(f))
        return f"{f:.4g}"
    except (ValueError, TypeError):
        return esc(v)

def typical_range(pd):
    ds = pd.get("distinct_sample") or []
    lo, hi = pd.get("min"), pd.get("max")
    if lo is not None and hi is not None:
        return f"{fmt_num(lo)} .. {fmt_num(hi)}"
    if ds:
        try:
            return f"{fmt_num(min(ds))} .. {fmt_num(max(ds))}"
        except Exception:
            return "-"
    return "-"

# type inference for the display column: use KB override if present else payload type,
# but apply global overrides for known continuous knobs.
FLOAT_OVERRIDE = {"Mix","Amount","Opacity","Intensity","Saturation","Softness"}
def disp_type(pname, pd, kbtype):
    if kbtype is not None:
        return kbtype
    t = pd.get("type")
    # global corrections
    if pname in FLOAT_OVERRIDE and t in ("bool",):
        return "float"
    if pd.get("fractional") and t == "bool":
        return "float"
    return t

def status_line(f):
    if f["implemented"]:
        mod = f.get("engine_module")
        line = f"**Implemented.** TS module: [`engine/src/compositor/filters/{mod}`](../../engine/src/compositor/filters/{mod})."
        sh = f.get("shader")
        if sh:
            line += f" Reverse-engineered against the verbatim `{sh}` Metal shader"
            # note if shader file checked in
            line += "."
        return line
    else:
        sh = f.get("shader")
        if sh:
            return f"**Not implemented.** A verbatim `{sh}` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/{sh}.metal` (Phase-1 done, Phase-2 open)."
        return "**Not implemented** (corpus-exercised; no dedicated shader extracted yet)."

PLUMBING_DESC = ("These are standard FxPlug/host boilerplate parameters shared by every Motion filter "
  "(on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling "
  "flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the "
  "full explanation.")

written = []
for f in top:
    pae = f["pae"]
    entry = kb.get(pae, {})
    what = entry.get("what", "*(No hand-authored description available.)*")
    note = entry.get("note")
    kbparams = entry.get("params", {})
    fn = slug(pae) + ".md"
    lines = []
    lines.append(f"# {pae}")
    lines.append("")
    lines.append(f"- **PAE class:** `{pae}`")
    lines.append(f"- **Plugin UUID:** `{f['uuid']}`")
    # display names
    dn = f.get("display_names") or []
    if dn:
        names = ", ".join(f"{esc(n)} ({c})" for n, c in dn[:6])
        lines.append(f"- **Node names in corpus:** {names}")
    lines.append(f"- **Corpus usage:** {f['files']} files, {f['instances']} instances")
    lines.append("")
    lines.append("## What it does")
    lines.append("")
    lines.append(what)
    if note:
        lines.append("")
        lines.append(f"> **Note.** {note}")
    lines.append("")
    lines.append("## Parameters")
    lines.append("")
    lines.append("Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.")
    lines.append("")
    lines.append("| Parameter | Type | Default | Typical range | What it controls |")
    lines.append("|---|---|---|---|---|")
    rp = f["real_params"]
    # --- Filter out non-creative / localized / internal-state rows that the
    # payload left in real_params. Keep everything in the KB verbatim. ---
    maxseen = max((pd.get("seen", 0) for pd in rp.values()), default=1) or 1
    # Explicit non-creative internal-state / UI / persisted-keyer parameters that
    # the payload leaves in real_params but are NOT user-facing creative knobs.
    INTERNAL_NAMES = {
        # Luma Keyer persisted keyer engine state (see KB note on that filter)
        "Chroma", "Graph", "Histogram", "OSC", "DefaultSoftness", "Strength",
        "Spill Level", "Chroma Rolloff", "Chroma Erode", "Fix Video",
        "MinGreen", "MaxGreen", "GreenChroma", "MinBlue", "MaxBlue", "BlueChroma",
        "Spill Contrast", "Tint", "Saturation", "Light Wrap", "Luma Erode",
        "KeyerIsInitialized",
        # misc UI toggles / mis-parsed orphan duplicates
        "Layer", "Controls", "IOS Compatability Behavior",
    }
    def is_localized(name):
        # non-ASCII => a localized (translated) parameter name
        try:
            name.encode("ascii")
            return False
        except UnicodeEncodeError:
            return True
    dropped_localized = 0
    dropped_internal = 0
    keep = {}
    for name, pd in rp.items():
        if name in kbparams:
            keep[name] = pd
            continue
        if is_localized(name):
            dropped_localized += 1
            continue
        # internal engine-state / hidden params, and the placeholder "?"
        if "::" in name or name.strip() in ("?", "") or name in INTERNAL_NAMES:
            dropped_internal += 1
            continue
        # low-seen orphan stragglers (rare mis-parsed / version-specific rows)
        seen = pd.get("seen", 0)
        if seen and seen < 0.10 * maxseen:
            dropped_internal += 1
            continue
        keep[name] = pd
    rp = keep
    # order: KB order first (if provided), then any remaining real_params
    ordered = []
    for k in kbparams.keys():
        if k in rp: ordered.append(k)
    for k in rp.keys():
        if k not in ordered: ordered.append(k)
    for pname in ordered:
        pd = rp[pname]
        kbtype, desc = (None, "*(unverified)*")
        if pname in kbparams:
            kbtype, desc = kbparams[pname]
        t = disp_type(pname, pd, kbtype)
        default = fmt_default(pd.get("default"))
        # nested/group/color params -> range is n/a
        if pd.get("type") in ("color","group","point2D","unknown") and not (pd.get("min") is not None):
            rng = "-"
        else:
            rng = typical_range(pd)
        kf = pd.get("keyframed", 0)
        kfnote = (f" *(keyframed in {kf} instance{'s' if kf != 1 else ''})*" if kf and kf > 0 else "")
        lines.append(f"| {esc(pname)} | {esc(t)} | {default} | {rng} | {desc}{kfnote} |")
    lines.append("")
    # FxPlug plumbing footer
    plumb = f.get("plumbing_params") or []
    lines.append("## FxPlug plumbing")
    lines.append("")
    if plumb:
        lines.append(f"Non-creative host parameters on this filter: {', '.join('`'+esc(p)+'`' for p in plumb)}. {PLUMBING_DESC}")
    else:
        lines.append(f"No extra plumbing parameters recorded. {PLUMBING_DESC}")
    lines.append("")
    lines.append("## Implementation status")
    lines.append("")
    lines.append(status_line(f))
    lines.append("")
    loc = f.get("localized_rows_dropped", 0) + dropped_localized
    if loc and loc > 0:
        lines.append(f"> {loc} localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.")
        lines.append("")
    if dropped_internal and dropped_internal > 0:
        lines.append(f"> {dropped_internal} non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.")
        lines.append("")
    open(os.path.join(OUTDIR, fn), "w").write("\n".join(lines))
    written.append((pae, fn, f["files"], len(rp), "implemented" if f["implemented"] else "not impl"))

print("Wrote", len(written), "filter docs")
for w in written[:5]:
    print(w)
