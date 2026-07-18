"""Synthetic single-filter scene generator — verify OCCLUDED primitives.

WHY: some filters (PAETint/PAENoise/PAEBadTV) live in a host transition where their layer is
NEVER composited into the visible frame at any time (max_oracle_signal==0 across all t). They
cannot be verified through the embedded host. This builds a MINIMAL .motr where the target
filter is the SOLE operation on a static, full-frame source image, so its parameter response
always drives the output.

APPROACH (byte-preserving, DOCTYPE-safe — ElementTree re-serialize breaks the oracle):
  scaffold = Movements__Fall (smallest host: DOCTYPE + factory table + Project/Widget + a
  simple Group with two drop-zone Image scenenodes "Transition A"/"Transition B", no masks/rigs).
  1. Neutralize Transition A's Transform block -> identity (strip the fall Position/Rotation)
     so source A sits static full-frame at ALL times (removes the transition's time-gating).
  2. Insert the target <filter pluginName=X> (copied verbatim from its real host, so its
     parameter tree + ids are authentic) as the LAST child of Transition A.
  3. Delete Transition B (only A drives output; nothing occludes the filtered image).
  Everything else (DOCTYPE, factory table, Project/Widget) is preserved byte-for-byte.

The result renders through the SAME oracle + engine + mirror-dir path as a real host, so the
delta-response sweep works unchanged — just with a scene where the filter is guaranteed visible.
"""
import os, re, sys
sys.path.insert(0, '.')
from fct import config
from fct.faithful import mutate

SCAFFOLD_SLUG = 'Movements__Fall'

# Identity Transform block: same param ids as the scaffold's Transform (id=100 Transform,
# 101 Position, 109 Rotation) but with NO offset/curve — so source A renders static full-frame.
_IDENTITY_TRANSFORM = (
    '<parameter name="Transform" id="100" flags="8589938704">\n'
    '\t\t\t\t\t<parameter name="Position" id="101" flags="8589938704">\n'
    '\t\t\t\t\t\t<foldFlags>15</foldFlags>\n'
    '\t\t\t\t\t</parameter>\n'
    '\t\t\t\t</parameter>\n'
    '\t\t\t\t')

def _scenenode_span(txt, name):
    a = txt.find('name="%s"' % name)
    if a < 0:
        return None, None
    start = txt.rfind('<scenenode', 0, a)
    end = txt.find('</scenenode>', a) + len('</scenenode>')
    return start, end

def _host_factories(host_txt):
    """{id: full <factory>...</factory> block} for every factory declared in the host."""
    out = {}
    for m in re.finditer(r'<factory id="(\d+)"[^>]*>.*?</factory>', host_txt, re.S):
        out[m.group(1)] = m.group(0)
    return out

def _scaffold_factory_uuids(scaf_txt):
    """{uuid: id} for factories already in the scaffold (so we reuse, not duplicate)."""
    out = {}
    for m in re.finditer(r'<factory id="(\d+)" uuid="([0-9a-f]+)">', scaf_txt):
        out[m.group(2)] = m.group(1)
    return out

def _graft_factories(scaf, fblock, host_txt):
    """Ensure every factory the filter block references exists in the scaffold's factory
    table. Copy any missing host factory in with a fresh id, and remap the block's
    factoryID="N" references accordingly. Returns (new_scaf, new_fblock).

    This is the piece that makes a grafted/synthetic filter actually INSTANTIATE: a filter
    with factoryID pointing at an absent factory is silently ignored by the engine (0
    response) — the root cause the first graft attempt hit."""
    host_facs = _host_factories(host_txt)
    scaf_by_uuid = _scaffold_factory_uuids(scaf)
    used = set(re.findall(r'factoryID="(\d+)"', fblock))
    next_id = max((int(i) for i in re.findall(r'<factory id="(\d+)"', scaf)), default=0) + 1
    remap = {}            # host factoryID -> scaffold factoryID
    new_factory_blocks = []
    for hid in used:
        fac = host_facs.get(hid)
        if fac is None:
            continue        # referenced factory not in host (shouldn't happen); leave as-is
        uuid = re.search(r'uuid="([0-9a-f]+)"', fac).group(1)
        if uuid in scaf_by_uuid:
            remap[hid] = scaf_by_uuid[uuid]        # scaffold already has this factory type
        else:
            new_id = str(next_id); next_id += 1
            remap[hid] = new_id
            # rewrite the copied factory's id
            fac2 = re.sub(r'(<factory id=")\d+(")', r'\g<1>%s\g<2>' % new_id, fac, count=1)
            new_factory_blocks.append(fac2)
            scaf_by_uuid[uuid] = new_id
    # remap the block's factoryID references (longest-id-first to avoid partial clobber)
    def _remap_block(b):
        for hid in sorted(remap, key=lambda x: -len(x)):
            b = re.sub(r'factoryID="%s"' % re.escape(hid), 'factoryID="%s"' % remap[hid], b)
        return b
    fblock2 = _remap_block(fblock)
    # inject new factory blocks at the end of the scaffold's factory table
    if new_factory_blocks:
        tpl = scaf.find('<template>')
        last = scaf.rfind('</factory>', 0, tpl) + len('</factory>')
        scaf = scaf[:last] + '\n\n' + '\n\n'.join(new_factory_blocks) + scaf[last:]
    return scaf, fblock2

# Full-span timing: in=0, offset=0, out=large — so the inserted node is ALIVE for the whole
# scaffold timeline. A generator/filter copied from its host carries the host's narrow,
# OFFSET timing window (e.g. PAENoise: offset="-4612608 7680000 1 0", a sliver near the host's
# transition midpoint) so at the sweep's sample times it is faded out / outside its window ->
# ~0 oracle response (the PAENoise NO_SIGNAL root cause). Matches PAETint's working full-span.
_FULL_TIMING = '<timing in="0 7680000 1 0" out="9993984 7680000 1 0" offset="0 7680000 1 0"/>'
_TIMING_RE = re.compile(r'<timing\b[^>]*/>')
_FADE_RE = re.compile(r'\s*<behavior name="Fade In/Fade Out"[^>]*>.*?</behavior>', re.S)

def _normalize_block_timing(fblock):
    """Make an inserted filter/generator block ALWAYS-ON: full-span its FIRST (top-level)
    <timing> and strip any Fade In/Fade Out behavior. Only the block's own timing is touched;
    nested child <timing> (behaviors we keep, if any) are left alone by replacing just the
    first occurrence — the node's own timing appears before any child's."""
    fblock = _FADE_RE.sub('', fblock)
    fblock = _TIMING_RE.sub(_FULL_TIMING, fblock, count=1)
    return fblock

def _filter_block(host_path, plugin):
    """Verbatim <filter ...>...</filter> (or generator <scenenode ...>) byte-block from its
    real host, so the synthetic scene uses the authentic parameter tree + ids."""
    txt = open(host_path, encoding='utf-8').read()
    fstart, fend = mutate._prim_byte_span(txt, plugin)
    if fstart is None:
        return None
    # _prim_byte_span returns (open-tag-start, close-tag-start); extend to close-tag end
    lt = txt.rfind('<', 0, txt.find('pluginName="%s"' % plugin))
    tagname = txt[lt + 1:].split(None, 1)[0].split('>', 1)[0]
    fend2 = txt.find('</%s>' % tagname, fstart) + len('</%s>' % tagname)
    return _normalize_block_timing(txt[fstart:fend2])

def build(plugin, host_path, is_generator=False):
    """Return synthetic .motr text (str) for `plugin`, or None if it can't be located.
    The scene renders from the SCAFFOLD's resource dir (mirror-dir handles relative paths).

    is_generator: the primitive is a GENERATOR scenenode (PAENoise/PAEColorSolid/PAECloudsV2),
    not a filter. A generator produces its OWN image rather than filtering the layer below, so
    if source A (Transition A) is left in the Group it OCCLUDES the generator and its param
    response is ~0 (PAENoise sibling scene: randomseed signal 1.5, opacity 1.7 — below floor).
    Removing source A makes the generator the SOLE visible content (solo scene: randomseed 82,
    opacity 141 — well above floor). A filter, by contrast, NEEDS source A as its input."""
    scaf = open(config.slug_motr(SCAFFOLD_SLUG), encoding='utf-8').read()
    fblock = _filter_block(host_path, plugin)
    if fblock is None:
        return None
    host_txt = open(host_path, encoding='utf-8').read()
    # 0. graft the filter's factory/factories into the scaffold table + remap the block's
    #    factoryID refs — WITHOUT this the filter points at an absent factory and is silently
    #    ignored (0 response), the root cause the first graft attempt hit.
    scaf, fblock = _graft_factories(scaf, fblock, host_txt)
    # 1. neutralize Transition A's Transform (identity full-frame)
    aStart, aEnd = _scenenode_span(scaf, 'Transition A')
    tstart = scaf.find('<parameter name="Transform" id="100"', aStart)
    cine = scaf.find('<parameter name="Cinematic"', aStart)
    if tstart < 0 or cine < 0 or not (aStart < tstart < cine < aEnd):
        return None
    scaf2 = scaf[:tstart] + _IDENTITY_TRANSFORM + scaf[cine:]
    # 2. insert the filter block as a LAYER-LEVEL sibling right after Transition A's
    #    </scenenode> (NOT inside the scenenode). A Motion filter attached to the enclosing
    #    <layer> filters the composited layer output — that's where working hosts put it
    #    (Blurs__Gaussian: the PAEGaussianBlur <filter> is a sibling of the Transition A/B
    #    scenenodes inside <layer name="Group">). A filter nested inside the image scenenode
    #    is NOT in the render path (0 response — the bug the first attempt hit).
    aStart, aEnd = _scenenode_span(scaf2, 'Transition A')   # recompute (offsets shifted)
    scaf3 = scaf2[:aEnd] + '\n\t\t' + fblock + scaf2[aEnd:]
    # 3. delete Transition B (only A drives output)
    bStart, bEnd = _scenenode_span(scaf3, 'Transition B')
    if bStart is not None:
        pre = scaf3.rfind('\n', 0, bStart)
        scaf3 = scaf3[:pre] + scaf3[bEnd:]
    # 4. for a GENERATOR, also delete Transition A so the generator is the sole visible layer
    #    (otherwise source A occludes it -> ~0 param response). A filter KEEPS source A as input.
    if is_generator:
        aStart, aEnd = _scenenode_span(scaf3, 'Transition A')
        if aStart is not None:
            pre = scaf3.rfind('\n', 0, aStart)
            scaf3 = scaf3[:pre] + scaf3[aEnd:]
    return scaf3

if __name__ == '__main__':
    plugin = sys.argv[1] if len(sys.argv) > 1 else 'PAETint'
    # host = first slug containing the plugin
    sm = config.slug_map()
    host = next((p for s, p in sm.items() if ('pluginName="%s"' % plugin) in open(p, encoding='utf-8').read()), None)
    out = build(plugin, host)
    print('built:', out is not None, 'bytes:', len(out) if out else 0)
    if out:
        # validity checks (no render): DOCTYPE preserved, well-formed XML, filter present, B gone
        import xml.etree.ElementTree as ET
        assert '<!DOCTYPE ozxmlscene>' in out, 'DOCTYPE lost'
        assert ('pluginName="%s"' % plugin) in out, 'filter not inserted'
        assert 'name="Transition B"' not in out.split('<clip')[0], 'Transition B scenenode not removed'
        try:
            ET.fromstring(out); print('XML well-formed: True')
        except Exception as e:
            print('XML PARSE ERROR:', e)
        open('/tmp/synth_%s.motr' % plugin, 'w', encoding='utf-8').write(out)
        print('wrote /tmp/synth_%s.motr' % plugin)
