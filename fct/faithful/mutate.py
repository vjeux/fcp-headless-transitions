"""Byte-preserving .motr parameter mutator.

ElementTree round-trip breaks the FCP oracle (drops <!DOCTYPE ozxmlscene>, reflows
whitespace/quotes) -> proven by the round-trip self-test (7.25 dB garbage). So we MUST
mutate at the raw-text level: change ONLY the target `value="..."` substrings and leave
every other byte identical. We still USE ElementTree to LOCATE which parameters to change
(by name-path within the target filter), then map each located <parameter> back to its
exact byte span in the source text and rewrite just its value attribute.

Guarantee (enforced by the harness self-test): mutating ZERO params yields byte-identical
output, and mutating N params changes exactly those N value= attributes and nothing else.
"""
import xml.etree.ElementTree as ET
import re, random

_NUM = re.compile(r'^-?\d+(\.\d+)?([eE][-+]?\d+)?$')

def _is_num(v): return v is not None and bool(_NUM.match(v.strip()))

def _leaf_name_paths(filter_elem):
    """(elem, name_path) for numeric scalar leaves in the filter subtree (see schema.py)."""
    def walk(el, path):
        for child in el:
            if child.tag != 'parameter':
                yield from walk(child, path); continue
            nm = (child.get('name') or '').replace(' ', '').lower()
            cpath = path + [nm] if nm else path
            child_params = [g for g in child if g.tag == 'parameter']
            v = child.get('value')
            if v is not None and _is_num(v) and not child_params:
                yield child, '/'.join(cpath)
            if child_params:
                yield from walk(child, cpath)
    yield from walk(filter_elem, [])

def plan(motr_text, plugin_name, param_ranges, rng):
    """Return list of (param_id, name, name_path, old_value, new_value) to change.
    Uses the DOM only to DECIDE; the actual edit is byte-level in apply()."""
    root = ET.fromstring(motr_text)
    felem = None
    for f in root.iter('filter'):
        if f.get('pluginName') == plugin_name: felem = f; break
    if felem is None: return None, {}
    changes = []; sampled = {}
    for pel, name_path in _leaf_name_paths(felem):
        for key, (lo, hi) in param_ranges.items():
            if key.replace(' ', '').lower() in name_path:
                nv = rng.uniform(lo, hi)
                changes.append({'id': pel.get('id'), 'name': pel.get('name'),
                                'path': name_path, 'old': pel.get('value'), 'new': '%.6f' % nv})
                sampled[name_path] = round(nv, 5)
                break
    return changes, sampled

def apply(motr_text, plugin_name, changes):
    """Byte-level rewrite: for each change, find the <parameter ...> tag with matching
    id + name + old value INSIDE the target filter's byte span, and rewrite only its
    value="..." . Everything else (DOCTYPE, whitespace, quotes) is preserved exactly."""
    # locate the filter's byte span so we don't touch same-named params in other filters
    fi = motr_text.find('pluginName="%s"' % plugin_name)
    if fi < 0: return motr_text
    fstart = motr_text.rfind('<filter', 0, fi)
    fend = motr_text.find('</filter>', fi)
    if fstart < 0 or fend < 0: return motr_text
    head, body, tail = motr_text[:fstart], motr_text[fstart:fend], motr_text[fend:]
    for c in changes:
        # match the exact parameter element by id + value (name may contain spaces/escapes)
        pat = re.compile(
            r'(<parameter\b[^>]*\bid="%s"[^>]*\bvalue=")%s(")' % (re.escape(c['id']), re.escape(c['old'])))
        body, n = pat.subn(lambda mo: mo.group(1) + c['new'] + mo.group(2), body, count=1)
        if n == 0:
            # value attr may precede id; try the reverse ordering
            pat2 = re.compile(
                r'(<parameter\b[^>]*\bvalue=")%s("[^>]*\bid="%s")' % (re.escape(c['old']), re.escape(c['id'])))
            body, _ = pat2.subn(lambda mo: mo.group(1) + c['new'] + mo.group(2), body, count=1)
    return head + body + tail

def mutate_text(motr_text, plugin_name, param_ranges, rng):
    changes, sampled = plan(motr_text, plugin_name, param_ranges, rng)
    if changes is None: return None, {}
    return apply(motr_text, plugin_name, changes), sampled

if __name__ == '__main__':
    import sys, json
    m = json.load(open('fct/slug_map.json'))
    txt = open(m[sys.argv[1]], encoding='utf-8').read()
    rng = random.Random(0)
    out, sp = mutate_text(txt, sys.argv[2], {'intensity': [0, 1], 'mix': [0, 1]}, rng)
    print("sampled:", sp)
    print("byte-identical when 0 changes:", mutate_text(txt, sys.argv[2], {}, rng)[0] == txt)
    # show the changed lines
    import difflib
    for l in difflib.unified_diff(txt.splitlines(), out.splitlines(), lineterm='', n=0):
        if l.startswith(('+', '-')) and 'value=' in l: print(l[:120])
