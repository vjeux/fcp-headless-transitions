#!/usr/bin/env python3
"""tools/re/filter_usage.py — map each implemented filter UUID to the built-in
transitions that use it (scans the 65 slug .motr files). Helps decide a Phase-2
change's blast radius + which transitions to re-score on the gate.

Usage: filter_usage.py            # print all
       filter_usage.py <UUID>     # transitions using one filter
"""
import json, os, sys

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

FILTERS = {
    'E472D646-2C92-464E-98A1-91CF8F162AD8': 'Gaussian Blur',
    '73F69C87-7226-4F7A-81F2-F5E378501423': 'Glow',
    '5599C557-CDC0-4112-B2C4-355E9A1A902E': 'Bloom',
    '2E7B1340-5D4F-4015-8AA0-53BEB9F2CA52': 'Directional Blur',
    '8F9F88CF-F1DC-4C7E-8946-1A8B53B4F53A': 'Radial Blur',
    '11C0E095-5F4F-46E2-AE28-F56ED7D38D7E': 'Zoom Blur',
    'B2E0DE39-119F-4AD6-8796-C18BF8FE27B8': 'Channel Mixer',
    '717D6E01-83F4-4A4B-AF92-42AABA4B176C': 'Tint',
    'D995BBCF-F766-4950-89D5-7A4828CD9B6F': 'Colorize',
    'D23AF030-B0BF-44DF-B622-7C9EA0DF5744': 'HSV Adjust',
    '2E4DBB0A-A950-4896-BC2D-A5B0CFF7FAC6': 'Brightness',
    '2B221FA1-08A2-416E-998C-D7559E5509B5': 'Levels',
    '7E9178C5-7B0F-4B86-884D-FE79F568B6CE': 'Luma Keyer',
    '9C655247-E514-458B-83BA-B3F63EFFD241': 'Bevel',
    '47D6B897-5749-4A6A-B93B-00FABCF72B25': 'Fill',
    '30911E49-2043-4EEC-88A8-2E4AAA835D59': 'PAENoise',
    'E61FE95E-0108-47DA-8F29-3CB3C47428EF': '360 Reorient',
}


def usage():
    sm = json.load(open(os.path.join(REPO, "fct", "slug_map.json")))
    out = {u: [] for u in FILTERS}
    for slug, motr in sorted(sm.items()):
        try:
            up = open(motr, encoding="utf-8", errors="ignore").read().upper()
        except OSError:
            continue
        for u in FILTERS:
            if u in up:
                out[u].append(slug)
    return out


def main():
    u = usage()
    if len(sys.argv) > 1:
        key = sys.argv[1].upper()
        print("\n".join(u.get(key, [])))
        return
    for uuid, name in FILTERS.items():
        print(f"{name:18s} ({len(u[uuid]):2d}): {', '.join(u[uuid])}")


if __name__ == "__main__":
    main()
