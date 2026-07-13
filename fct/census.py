"""fct census — decode a slug's REAL scene-graph structure straight from its .motr.

WHY THIS EXISTS (baked-in forcing function): twice the ROADMAP sent a tick chasing a
task premise that the scene graph flatly contradicted. "colour-channel Link drives
Color_Planes" was wrong (its Links drive position.Z / rotation — a 3D fold); "gradient
generator fills Slide_In" was wrong (its "Gradient" node is a PAINT STROKE: Brush
Profile + Emitter + Cell). Each wrong premise cost a chunk of a tick to a black-box
render diff. `census` makes "read the scene graph FIRST" a one-second command, so every
tick VERIFIES the premise before writing engine code (decode-don't-fit, applied to the
task list itself).

Reports, per slug, resolved from the FACTORY TABLE (factoryID -> <description>, which
is per-file — ids are NOT stable across .motr files, so we always read the table):
  - node-type histogram (Emitter / Link / Shape / Generator / Clone Layer / ...)
  - <filter> ProPlugin filters by pluginName (the real colour/warp ops in play)
  - <behavior> Link behaviours + the CHANNEL each drives, decoded from the
    affectingChannel path (e.g. ./1/100/101/3 = transform>position>Z). Colour links
    (a source colour piped into a fill/remap, e.g. ./2/353/113/111) are called out
    separately, so "is this a colour link?" is answered by the DATA, never guessed.
  - Generators by pluginName, flagging paint-stroke ("Gradient"/gen + Emitter child)
  - Emitter/Cell counts (particle-dominated slugs)
No rendering, no FCP - pure XML. `fct census <slug> [slug...]` or `--all`.
"""
import os, re, sys
from collections import Counter

# affectingChannel path decode. Motion encodes the driven channel as a parameter PATH
# like "./1/100/101/3": 100 = TRANSFORM folder, then a sub-folder id selects the
# property and the trailing int is the axis (1=X 2=Y 3=Z).
#   100/101 position, 100/102 rotation, 100/103|105 scale, 100/107 anchor,
#   200/2xx blending/opacity. COLOUR is driven via a FILTER/GENERATOR colour folder
#   (Colorize's 353/113 fill group, Red/Green/Blue) - a path that does NOT pass
#   through 100/200. That path shape is the discriminator between a transform link and
#   a colour-channel link (the distinction two ticks got wrong from prose alone).
_SUBFOLDER = {"101": "position", "102": "rotation", "103": "scale",
              "105": "scale", "107": "anchor"}
_AXIS = {"1": "X", "2": "Y", "3": "Z"}


def _classify_channel(path, link_name=""):
    low = (path + " " + link_name).lower()
    segs = [p for p in path.split("/") if p and p != "."]
    # COLOUR target sub-kind (matches the 3 renderer buckets in evaluator/color-links.ts +
    # the gradient-tag decode in docs/notes/GRADIENT_TAG_COLOUR_LINK_RE.md). Reporting the
    # SPECIFIC kind — not a flat "COLOUR" — tells you exactly which renderer path a link
    # needs, and validates the decode straight from the .motr. Discriminate by path shape:
    #   104 present            -> gradient-tag stop colour (Gradient(104)/RGB folder/stop/Color/RGB)
    #   353 present (Colorize) -> Colorize Remap Black/White folder
    #   113/111 (no 104/353)   -> a Shape's Fill Color (id 111 under Fill 113)
    is_colour_name = any(k in low for k in ("red", "green", "blue", "color", "colour",
                                            "remap", "fill", "gradient", "tint"))
    is_colour_path = "100" not in segs and any(s in ("353", "113", "111", "104") for s in segs)
    if is_colour_name or is_colour_path:
        if "104" in segs:
            return "COLOUR:gradientTag"      # renderer TBD — see GRADIENT_TAG_COLOUR_LINK_RE.md
        if "353" in segs:
            return "COLOUR:colorizeRemap"    # rendered (channel-mixer.ts)
        if "111" in segs or "113" in segs:
            return "COLOUR:shapeFill"        # rendered (compositor shape branch)
        return "COLOUR"
    if "100" in segs:
        i = segs.index("100")
        sub = segs[i + 1] if i + 1 < len(segs) else ""
        axis = segs[i + 2] if i + 2 < len(segs) else ""
        prop = _SUBFOLDER.get(sub, "transform[%s]" % sub)
        return "%s.%s" % (prop, _AXIS.get(axis, axis)) if axis else prop
    if any(s in ("200", "201", "202") for s in segs):
        return "opacity"
    return "?[%s]" % "/".join(segs[-3:])


def _factory_map(xml):
    fac = {}
    for m in re.finditer(r'<factory id="(\d+)"[^>]*>(.*?)</factory>', xml, re.S):
        d = re.search(r'<description>([^<]+)</description>', m.group(2))
        fac[int(m.group(1))] = d.group(1).strip() if d else "?"
    return fac


def _links(xml, fac):
    # Links are <behavior> elements (NOT <scenenode>): scanning scenenodes alone - the
    # bug this tool exists to prevent - misses every Link.
    link_fids = {fid for fid, d in fac.items() if d == "Link"}
    out = []
    for m in re.finditer(r'<behavior\b([^>]*)>(.*?)</behavior>', xml, re.S):
        a = dict(re.findall(r'(\w+)="([^"]*)"', m.group(1)))
        if int(a.get("factoryID", "0") or 0) not in link_fids:
            continue
        name = a.get("name", "?")
        body = m.group(2)
        chans = re.findall(r'affectingChannel="([^"]*)"', body) \
            + re.findall(r'<sourceChannelRef>([^<]+)</sourceChannelRef>', body)
        props = sorted({_classify_channel(c, name) for c in chans}) or ["<unresolved>"]
        out.append({"name": name, "channels": props,
                    "colour": any(p.startswith("COLOUR") for p in props)})
    return out


def _gravities(xml, fac):
    # Gravity is a <behavior> whose factoryID resolves to description "Gravity"
    # (id NOT stable across .motr files — always read from the factory table).
    # Report the HOST scenenode's factory (Particle Cell vs Layer/Group vs Emitter):
    # T-A3 census 2026-07-13 proved every built-in Gravity sits on a Particle Cell,
    # never a layer — so "layer fall" is not a real usage, gravity is a particle-sim
    # parameter (folded into T-B1). Future ticks reading this line skip the trap.
    grav_fids = {fid for fid, d in fac.items() if d == "Gravity"}
    if not grav_fids:
        return []
    out = []
    for m in re.finditer(r'<behavior\b([^>]*)>', xml):
        a = dict(re.findall(r'(\w+)="([^"]*)"', m.group(1)))
        if int(a.get("factoryID", "0") or 0) not in grav_fids:
            continue
        # Walk back to the innermost enclosing <scenenode>.
        host_fac = "?"
        for m2 in reversed(list(re.finditer(r'<scenenode\b([^>]*)>', xml[:m.start()]))):
            between = xml[m2.end():m.start()]
            if len(re.findall(r'<scenenode\b', between)) == len(re.findall(r"</scenenode>", between)):
                a2 = dict(re.findall(r'(\w+)="([^"]*)"', m2.group(1)))
                host_fac = fac.get(int(a2.get("factoryID", "0") or 0), "?")
                break
        out.append({"host": host_fac, "name": a.get("name", "Gravity")})
    return out


def census_slug(slug, motr):
    xml = open(motr, encoding="utf-8", errors="ignore").read()
    fac = _factory_map(xml)
    types = Counter()
    for m in re.finditer(r'<(scenenode|layer|mask)\b([^>]*)>', xml):
        a = dict(re.findall(r'(\w+)="([^"]*)"', m.group(2)))
        types[fac.get(int(a.get("factoryID", "0") or 0), "?")] += 1
    filters = Counter(re.findall(r'<filter\b[^>]*\bpluginName="([^"]+)"', xml))
    gen_fids = {fid for fid, d in fac.items() if d == "Generator"}
    generators = []
    for m in re.finditer(r'<scenenode\b([^>]*)>', xml):
        a = dict(re.findall(r'(\w+)="([^"]*)"', m.group(1)))
        if int(a.get("factoryID", "0") or 0) in gen_fids:
            tail = xml[m.start():m.start() + 800]
            paint = ('factoryID="19"' in tail or 'name="Emitter"' in tail
                     or "Brush Profile" in tail or "Cell copy" in tail)
            generators.append({"pluginName": a.get("pluginName", "?"), "paintStroke": paint})
    return {"slug": slug, "bytes": len(xml), "nodeTypes": dict(types.most_common()),
            "filters": dict(filters.most_common()), "generators": generators,
            "emitters": types.get("Emitter", 0),
            "cells": types.get("Particle Cell", 0) + types.get("Cell", 0),
            "links": _links(xml, fac),
            "gravities": _gravities(xml, fac)}


def _print(c):
    print("\n=== %s  (%s bytes) ===" % (c["slug"], format(c["bytes"], ",")))
    print("  node types :", ", ".join("%s x%d" % (k, v) for k, v in c["nodeTypes"].items()))
    if c["filters"]:
        print("  filters    :", ", ".join("%s x%d" % (k, v) for k, v in c["filters"].items()))
    if c["generators"]:
        print("  generators :", ", ".join(
            "%s%s" % (g["pluginName"], "[PAINT-STROKE]" if g["paintStroke"] else "[fill]")
            for g in c["generators"]))
    if c["emitters"] or c["cells"]:
        print("  particles  : %d emitter(s), %d cell(s)" % (c["emitters"], c["cells"]))
    if c["gravities"]:
        hosts = Counter(g["host"] for g in c["gravities"])
        print("  gravity    : %d behavior(s) on %s"
              % (len(c["gravities"]),
                 ", ".join("%s x%d" % (h, n) for h, n in hosts.most_common())))
    if c["links"]:
        n_col = sum(1 for l in c["links"] if l["colour"])
        print("  links      : %d total (%d transform, %d COLOUR)"
              % (len(c["links"]), len(c["links"]) - n_col, n_col))
        for l in c["links"]:
            flag = "  <<< COLOUR-LINK" if l["colour"] else ""
            print("      '%s' -> %s%s" % (l["name"], ", ".join(l["channels"]), flag))
    else:
        print("  links      : (none)")


def run(slugs):
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from fct.config import slug_map
    sm = slug_map()
    out = []
    for s in slugs:
        if s not in sm:
            print("  ?? unknown slug %s" % s, file=sys.stderr)
            continue
        c = census_slug(s, sm[s])
        out.append(c)
        _print(c)
    return out
