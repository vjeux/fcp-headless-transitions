"""Extract the REAL parameter schema of a Motion filter from the .motr DOM.

The catalog must NOT guess param names/ranges (an earlier draft guessed 'RemapBlackR'
etc. that don't exist). This reads the actual <parameter> leaves of a filter instance in
a host slug: name-path, authored value (the center point to fuzz around), and whether the
leaf is animated (has a <curve>). Ranges are then derived from the authored value + the
param's semantic class (normalized 0..1, angle 0..360, radius/amount, signed), so the
fuzzer samples the TRUE parameter space, not a made-up one.
"""
import xml.etree.ElementTree as ET
import re, json
from fct.faithful import mutate

_NUM = re.compile(r'^-?\d+(\.\d+)?([eE][-+]?\d+)?$')

def _range_for(name_path, authored):
    """Heuristic range from the leaf's name + authored value. Conservative + semantic:
    normalized channels/opacity/mix -> [0,1]; angle -> [0,360]; signed offsets around
    authored; else [0, max(2*authored, small)]. The point is to exercise a WIDE span of
    the real param, not to hit an exact Motion max (the oracle is truth at any value)."""
    n = name_path.lower()
    a = authored
    if any(k in n for k in ('red', 'green', 'blue', 'alpha', 'opacity', 'intensity', 'mix',
                            'amount', 'saturation', 'threshold')) and 0 <= a <= 1.0001:
        return [0.0, 1.0]
    if 'angle' in n or 'rotation' in n:
        return [0.0, 360.0]
    if 'hue' in n:
        return [-180.0, 180.0]
    if 'gamma' in n:
        return [0.1, 4.0]
    if a == 0:
        return [0.0, 1.0]
    if a < 0:
        return [2.0 * a, -2.0 * a]
    return [0.0, 2.0 * a]

def extract(host_motr_path, plugin_name):
    """Return {name_path: {authored, animated, range}} for the filter's numeric leaves."""
    root = ET.parse(host_motr_path).getroot()
    felem = mutate.find_filter_elem(root, plugin_name)
    if felem is None:
        return {}
    out = {}
    for pel, name_path in mutate.leaf_scalar_params(felem):
        v = pel.get('value')
        if not (v and _NUM.match(v.strip())):
            continue
        authored = float(v)
        animated = pel.find('curve') is not None
        out[name_path] = {'authored': round(authored, 5), 'animated': animated,
                          'range': _range_for(name_path, authored)}
    return out

if __name__ == '__main__':
    import sys
    m = json.load(open('fct/slug_map.json'))
    slug = sys.argv[1]; plugin = sys.argv[2]
    sch = extract(m[slug], plugin)
    print(json.dumps(sch, indent=2))
