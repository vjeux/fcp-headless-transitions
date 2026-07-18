"""Byte-preserving .motr parameter mutator (filters AND generator scenenodes).

ElementTree round-trip breaks the FCP oracle (drops <!DOCTYPE ozxmlscene>, reflows
whitespace/quotes) -> proven by the round-trip self-test (7.25 dB garbage). So we MUST
mutate at the raw-text level: change ONLY the target `value="..."` substrings and leave
every other byte identical. We USE ElementTree only to LOCATE which parameters to change
(by name-path within the target primitive), then map each located <parameter> back to its
exact byte span in the source text and rewrite just its value attribute.

A "primitive" is either a <filter pluginName="X"> OR a generator <scenenode pluginName="X">
(e.g. PAEColorSolid, PAENoise, PAECloudsV2 are scenenode generators, NOT filters). The
locator handles both, keyed on pluginName, so the harness is not filter-only.

Guarantee (enforced by the harness self-test T1): mutating ZERO params yields byte-identical
output; mutating N params changes exactly those N value= attributes and nothing else.
"""
import xml.etree.ElementTree as ET
import re, random

_NUM = re.compile(r'^-?\d+(\.\d+)?([eE][-+]?\d+)?$')
# Element tags that can host a PAE primitive keyed by pluginName.
_PRIM_TAGS = ('filter', 'scenenode', 'generator')

def _is_num(v): return v is not None and bool(_NUM.match(v.strip()))
def _norm(s): return (s or '').replace(' ', '').replace('\xa0', '').lower()

def find_primitive_elem(root, plugin_name):
    """The element (filter OR generator scenenode) whose pluginName == plugin_name, or None.

    CANONICAL locator — schema.py, plan(), set_params(), apply() and the sweep all use this
    so 'which node do we fuzz' is defined in ONE place. FIRST match in document order (host
    slugs are chosen so the target is the primary instance). Handles both <filter> and the
    generator <scenenode>/<generator> forms (PAEColorSolid/PAENoise/PAECloudsV2 are scenenode
    generators, not filters — a filter-only locator silently misses them)."""
    for el in root.iter():
        if el.tag in _PRIM_TAGS and el.get('pluginName') == plugin_name:
            return el
    return None

# Back-compat: old name (filter-only intent) now delegates to the general locator.
def find_filter_elem(root, plugin_name):
    return find_primitive_elem(root, plugin_name)

def leaf_scalar_params(prim_elem):
    """(elem, name_path) for numeric scalar leaves in the primitive subtree.

    CANONICAL param enumeration. A 'leaf scalar' is a <parameter> with a numeric value= and
    NO child <parameter> (so we fuzz scalar members, never group headers). name_path is the
    '/'-joined normalized param names from the primitive root down to the leaf — the key
    schema/ranges match against. Normalization strips spaces AND non-breaking spaces
    (Motion uses U+00A0 in names like '360 aware')."""
    def walk(el, path):
        for child in el:
            if child.tag != 'parameter':
                yield from walk(child, path); continue
            nm = _norm(child.get('name'))
            cpath = path + [nm] if nm else path
            child_params = [g for g in child if g.tag == 'parameter']
            v = child.get('value')
            if v is not None and _is_num(v) and not child_params:
                yield child, '/'.join(cpath)
            if child_params:
                yield from walk(child, cpath)
    yield from walk(prim_elem, [])

# Back-compat alias (old private name used inside this module + tests).
_leaf_name_paths = leaf_scalar_params

def curve_params(prim_elem):
    """(elem, name_path, curve_elem) for CURVE-DRIVEN (animated) numeric params.

    Many filters store their MEANINGFUL parameter on a <curve> child, not a value= attr
    (PAEBadTV Waviness/Static/Scan Line*, PAENoise dimensions, PAEGaussianBlur Amount, …).
    leaf_scalar_params SKIPS these (the <parameter> has value=None), so the scalar-only
    fuzzer can't drive them — a real coverage gap. This enumerates them so set_curve_params
    can flatten a curve to a constant fuzzable value. name_path is the same '/'-joined
    normalized-name key. A <parameter> that has BOTH a value= and a <curve> is NOT returned
    here (it's already a scalar leaf); only value-less curve params are."""
    def walk(el, path):
        for child in el:
            if child.tag != 'parameter':
                yield from walk(child, path); continue
            nm = _norm(child.get('name'))
            cpath = path + [nm] if nm else path
            child_params = [g for g in child if g.tag == 'parameter']
            curve = child.find('curve')
            if curve is not None and child.get('value') is None and not child_params:
                yield child, '/'.join(cpath), curve
            if child_params:
                yield from walk(child, cpath)
    yield from walk(prim_elem, [])

def set_curve_params(motr_text, plugin_name, values):
    """Flatten animated CURVE params to constant values (byte-preserving) for the delta sweep.

    For each curve param whose name_path matches a `values` key, rewrite its <curve
    default="..." value="..."> AND every nested <keypoint>...<value>X</value> to the target,
    so the param holds that CONSTANT value at ALL times (no interpolation). This is what lets
    the fuzzer drive animated params (BadTV/Noise) that the scalar-leaf path can't reach.
    Returns (mutated_text, applied)."""
    root = ET.fromstring(motr_text)
    pelem = find_primitive_elem(root, plugin_name)
    if pelem is None:
        return None, {}
    # decide targets from the DOM (param id + which value keys match)
    targets = []; applied = {}
    for pel, name_path, _curve in curve_params(pelem):
        for key, val in values.items():
            if _norm(key) == name_path or _norm(key) in name_path:
                targets.append((pel.get('id'), name_path, float(val)))
                applied[name_path] = float(val)
                break
    if not targets:
        return motr_text, {}
    fstart, fend = _prim_byte_span(motr_text, plugin_name)
    if fstart is None:
        return motr_text, {}
    head, body, tail = motr_text[:fstart], motr_text[fstart:fend], motr_text[fend:]

    def _rewrite_one_curve(param_body, newval):
        vs = '%.6f' % newval
        # <curve ... default="X" value="Y"> -> set both to newval
        param_body = re.sub(r'(<curve\b[^>]*\bdefault=")[^"]*(")', r'\g<1>%s\g<2>' % vs, param_body, count=1)
        param_body = re.sub(r'(<curve\b[^>]*\bvalue=")[^"]*(")', r'\g<1>%s\g<2>' % vs, param_body, count=1)
        # every keypoint <value>...</value> -> newval (constant across time)
        param_body = re.sub(r'(<value>)[^<]*(</value>)', r'\g<1>%s\g<2>' % vs, param_body)
        return param_body

    for pid, _np, newval in targets:
        # isolate this <parameter id="pid" ...> ... </parameter> span within body
        m = re.search(r'<parameter\b[^>]*\bid="%s"[^>]*>' % re.escape(pid), body)
        if not m:
            continue
        pstart = m.start()
        # find matching </parameter> accounting for nested <parameter> (curve params have none,
        # but be safe): scan with depth.
        depth = 0; i = pstart; pend = None
        for mm in re.finditer(r'<(/?)parameter\b', body[pstart:]):
            if mm.group(1) == '':
                depth += 1
            else:
                depth -= 1
                if depth == 0:
                    pend = pstart + mm.end() + len('>')  # include up to '>' of </parameter>
                    # find the actual '>' after </parameter
                    gt = body.find('>', pstart + mm.start())
                    pend = gt + 1
                    break
        if pend is None:
            continue
        body = body[:pstart] + _rewrite_one_curve(body[pstart:pend], newval) + body[pend:]
    return head + body + tail, applied

def _prim_byte_span(motr_text, plugin_name):
    """(fstart, fend) byte span of the primitive element in the raw text, or (None,None).
    Spans by the ACTUAL enclosing tag (filter OR scenenode), not a hardcoded </filter>."""
    fi = motr_text.find('pluginName="%s"' % plugin_name)
    if fi < 0:
        return None, None
    lt = motr_text.rfind('<', 0, fi)
    if lt < 0:
        return None, None
    tagname = motr_text[lt + 1:].split(None, 1)[0].split('>', 1)[0]
    close = '</%s>' % tagname
    fend = motr_text.find(close, fi)
    if fend < 0:
        return None, None
    return lt, fend

def _collect_changes(motr_text, plugin_name, chooser):
    """Shared planning: for each fuzzable leaf, `chooser(name_path, old_value)` returns a
    new string value or None (skip). Returns (changes, sampled) or (None, {}) if the
    primitive is absent."""
    root = ET.fromstring(motr_text)
    pelem = find_primitive_elem(root, plugin_name)
    if pelem is None:
        return None, {}
    changes = []; sampled = {}
    for pel, name_path in leaf_scalar_params(pelem):
        nv = chooser(name_path, pel.get('value'))
        if nv is None:
            continue
        changes.append({'id': pel.get('id'), 'name': pel.get('name'),
                        'path': name_path, 'old': pel.get('value'), 'new': nv})
        sampled[name_path] = float(nv)
    return changes, sampled

def plan(motr_text, plugin_name, param_ranges, rng):
    """RANDOM planner: sample uniform in range for every leaf whose name_path CONTAINS a
    range key. (Legacy random API — the delta sweep uses set_params instead.)"""
    def chooser(name_path, old):
        for key, (lo, hi) in param_ranges.items():
            if _norm(key) in name_path:
                return '%.6f' % rng.uniform(lo, hi)
        return None
    return _collect_changes(motr_text, plugin_name, chooser)

def apply(motr_text, plugin_name, changes):
    """Byte-level rewrite: for each change, find the <parameter ...> with matching id + old
    value INSIDE the target primitive's byte span, and rewrite only its value="...".
    Everything else (DOCTYPE, whitespace, quotes) is preserved exactly."""
    fstart, fend = _prim_byte_span(motr_text, plugin_name)
    if fstart is None:
        return motr_text
    head, body, tail = motr_text[:fstart], motr_text[fstart:fend], motr_text[fend:]
    for c in changes:
        pat = re.compile(
            r'(<parameter\b[^>]*\bid="%s"[^>]*\bvalue=")%s(")' % (re.escape(c['id']), re.escape(c['old'])))
        body, n = pat.subn(lambda mo: mo.group(1) + c['new'] + mo.group(2), body, count=1)
        if n == 0:
            pat2 = re.compile(
                r'(<parameter\b[^>]*\bvalue=")%s("[^>]*\bid="%s")' % (re.escape(c['old']), re.escape(c['id'])))
            body, _ = pat2.subn(lambda mo: mo.group(1) + c['new'] + mo.group(2), body, count=1)
    return head + body + tail

def mutate_text(motr_text, plugin_name, param_ranges, rng):
    """Legacy random mutate (kept for selftest T1/T2)."""
    changes, sampled = plan(motr_text, plugin_name, param_ranges, rng)
    if changes is None: return None, {}
    return apply(motr_text, plugin_name, changes), sampled

def set_params(motr_text, plugin_name, values):
    """DETERMINISTIC mutate for the delta sweep: `values` maps a param name_path (or a
    substring of one) -> exact numeric value. Sets each matching leaf to that value.
    Returns (mutated_text, applied) where applied maps matched name_path -> value. Byte-
    preserving. This is the primary API for the ungameable delta-response fuzzer."""
    def chooser(name_path, old):
        for key, val in values.items():
            if _norm(key) == name_path or _norm(key) in name_path:
                return '%.6f' % float(val)
        return None
    changes, applied = _collect_changes(motr_text, plugin_name, chooser)
    if changes is None:
        return None, {}
    return apply(motr_text, plugin_name, changes), applied

if __name__ == '__main__':
    import sys, json
    m = json.load(open('fct/slug_map.json'))
    txt = open(m[sys.argv[1]], encoding='utf-8').read()
    out, sp = set_params(txt, sys.argv[2], {'mix': 0.5})
    print("set mix=0.5 sampled:", sp)
    print("byte-identical when 0 changes:", set_params(txt, sys.argv[2], {})[0] == txt)
    import difflib
    for l in difflib.unified_diff(txt.splitlines(), out.splitlines(), lineterm='', n=0):
        if l.startswith(('+', '-')) and 'value=' in l: print(l[:120])
