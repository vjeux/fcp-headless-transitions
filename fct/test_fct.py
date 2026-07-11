"""fct.test_fct — CI coverage for the fct toolkit's pure logic.

Runs with NO FCP install and NO rendered frames on disk: every test builds its own
synthetic arrays / files in a tmp dir, or uses the committed fixture .motr. Covers
the four pure-logic seams (read, color, compare, score) + the timing model.

Run:  python3 -m pytest fct/            (from the repo root, in the venv)
"""
import os
import numpy as np
import pytest
from PIL import Image

from fct import color, compare, read, timing, config


# ---------------------------------------------------------------- color --------
def test_to_bt709_shape_and_range():
    """to_bt709 preserves shape and clamps into 0..255."""
    a = np.linspace(0, 255, 300, dtype=np.float64).reshape(10, 10, 3)
    out = color.to_bt709(a)
    assert out.shape == a.shape
    assert out.min() >= 0.0 and out.max() <= 255.0

def test_to_bt709_monotonic_per_channel():
    """The power law is monotonic non-decreasing in the input per channel."""
    ramp = np.tile(np.linspace(0, 255, 256).reshape(256, 1, 1), (1, 1, 3))
    out = color.to_bt709(ramp)
    for c in range(3):
        col = out[:, 0, c]
        assert np.all(np.diff(col) >= -1e-9), f"channel {c} not monotonic"

def test_to_bt709_black_stays_near_black():
    """0 in -> near-0 out. to_bt709 floors the input at 1e-4 before the power law
    (avoids 0**gamma / log(0) blowups downstream), so pure black maps to a tiny
    positive value ~255*gain*(1e-4)**gamma, not exactly 0. Assert it stays < 0.05."""
    z = np.zeros((4, 4, 3), np.float64)
    assert color.to_bt709(z).max() < 0.05

def test_to_bt709_matches_config_gam():
    """to_bt709 applies exactly config.GAM (no drift / second source of truth)."""
    a = np.full((2, 2, 3), 128.0)
    out = color.to_bt709(a)
    for c, ch in enumerate("RGB"):
        g, gain = config.GAM[ch]
        expect = 255.0 * gain * (128.0 / 255.0) ** g
        assert out[0, 0, c] == pytest.approx(expect, abs=1e-6)


# ---------------------------------------------------------------- read ---------
def test_read_frame_missing_returns_black(tmp_path):
    """A missing file yields a black frame at the requested size (never crashes)."""
    arr = read.read_frame(str(tmp_path / "nope.jpg"), size=(32, 16))
    assert arr.shape == (16, 32, 3)
    assert arr.max() == 0.0

def test_read_frame_roundtrip(tmp_path):
    """A written frame reads back to (H,W,3) float64 with matching pixels."""
    src = (np.random.default_rng(0).integers(0, 256, (12, 20, 3))).astype(np.uint8)
    p = str(tmp_path / "f.png")
    Image.fromarray(src).save(p)
    arr = read.read_frame(p)
    assert arr.shape == (12, 20, 3)
    assert arr.dtype == np.float64
    assert np.array_equal(arr, src.astype(np.float64))

def test_read_frame_resize(tmp_path):
    p = str(tmp_path / "f.png")
    Image.fromarray(np.zeros((40, 40, 3), np.uint8)).save(p)
    arr = read.read_frame(p, size=(10, 5))
    assert arr.shape == (5, 10, 3)

def test_read_frame_cached_cold_equals_warm(tmp_path):
    """The famous cold==warm invariant: first (build) read and second (reuse) read
    return byte-identical pixels, so `fct baseline` and `fct regress` never disagree."""
    src = (np.random.default_rng(1).integers(0, 256, (30, 50, 3))).astype(np.uint8)
    p = str(tmp_path / "src.jpg")
    Image.fromarray(src).save(p)
    cold = read.read_frame_cached(p, (16, 9))
    warm = read.read_frame_cached(p, (16, 9))
    assert cold.shape == (9, 16, 3)
    assert np.array_equal(cold, warm)

def test_read_frame_cached_rebuilds_on_mtime(tmp_path):
    """A newer source invalidates the thumbnail (re-rendered slug picks up changes)."""
    p = str(tmp_path / "src.jpg")
    Image.fromarray(np.zeros((20, 20, 3), np.uint8)).save(p)
    first = read.read_frame_cached(p, (8, 8))
    assert first.max() == 0.0
    # rewrite the source brighter with a strictly newer mtime
    Image.fromarray(np.full((20, 20, 3), 200, np.uint8)).save(p)
    os.utime(p, (os.path.getmtime(p) + 10, os.path.getmtime(p) + 10))
    second = read.read_frame_cached(p, (8, 8))
    assert second.mean() > 150.0


# ---------------------------------------------------------------- compare ------
def test_compare_identical_is_high_psnr(tmp_path):
    a = (np.random.default_rng(2).integers(0, 256, (24, 32, 3))).astype(np.uint8)
    pa = str(tmp_path / "a.png"); pb = str(tmp_path / "b.png")
    Image.fromarray(a).save(pa); Image.fromarray(a).save(pb)
    r = compare.compare(pa, pb)
    assert r["psnr"] == 99.0
    assert r["max_diff"] == 0.0
    assert r["shape"] == [24, 32, 3]

def test_compare_diff_lowers_psnr(tmp_path):
    a = np.full((16, 16, 3), 100, np.uint8)
    b = np.full((16, 16, 3), 140, np.uint8)  # uniform 40-level offset
    pa = str(tmp_path / "a.png"); pb = str(tmp_path / "b.png")
    Image.fromarray(a).save(pa); Image.fromarray(b).save(pb)
    r = compare.compare(pa, pb)
    # PSNR for a uniform 40 offset = 10*log10(255^2/40^2) ~ 16.08 dB
    assert r["psnr"] == pytest.approx(16.08, abs=0.1)
    assert r["max_diff"] == pytest.approx(40.0, abs=1e-6)

def test_compare_shape_mismatch_resizes(tmp_path):
    """b is resized to a's shape before comparing (no crash on size mismatch)."""
    Image.fromarray(np.zeros((20, 20, 3), np.uint8)).save(str(tmp_path / "a.png"))
    Image.fromarray(np.zeros((40, 40, 3), np.uint8)).save(str(tmp_path / "b.png"))
    r = compare.compare(str(tmp_path / "a.png"), str(tmp_path / "b.png"))
    assert r["shape"] == [20, 20, 3]

def test_compare_color_conform_changes_psnr(tmp_path):
    """color_a='bt709' applies the sRGB->bt709 model before comparing."""
    mid = np.full((16, 16, 3), 128, np.uint8)
    pa = str(tmp_path / "a.png"); pb = str(tmp_path / "b.png")
    Image.fromarray(mid).save(pa); Image.fromarray(mid).save(pb)
    plain = compare.compare(pa, pb)["psnr"]
    conformed = compare.compare(pa, pb, color_a="bt709")["psnr"]
    assert plain == 99.0
    assert conformed < 99.0  # color model shifts one side


# ---------------------------------------------------------------- score --------
def test_score_synthetic(tmp_path, monkeypatch):
    """score() reads a source's N frames + GUI GT's N frames from disk and returns
    per-frame + mean PSNR. Build a tiny 2-source layout in a tmp dir and point the
    config source dirs at it (no FCP, no real frames)."""
    N = config.N_FRAMES
    gui_dir = tmp_path / "gui" / "SLUG"
    hdl_dir = tmp_path / "hdl" / "SLUG"
    gui_dir.mkdir(parents=True); hdl_dir.mkdir(parents=True)
    rng = np.random.default_rng(3)
    for i in range(N):
        frame = rng.integers(0, 256, (8, 8, 3)).astype(np.uint8)
        Image.fromarray(frame).save(gui_dir / f"frame_{i:04d}.jpg")
        Image.fromarray(frame).save(hdl_dir / f"frame_{i:04d}.jpg")  # identical
    src = dict(config.SOURCES)
    src["gui"] = {"dir": str(tmp_path / "gui"), "color": "bt709"}
    src["headless"] = {"dir": str(tmp_path / "hdl"), "color": "bt709"}  # no conform
    monkeypatch.setattr(config, "SOURCES", src)
    from fct import score as score_mod
    r = score_mod.score("SLUG", "headless")
    assert r["n"] == N
    assert r["mean"] > 40.0  # identical frames (JPEG-lossy) score very high


# ---------------------------------------------------------------- timing -------
def test_sample_time_half_open():
    """frame i sits at (i/N)*span; frame 0 = 0, last frame < span."""
    span = 2.0; N = 24
    assert timing.sample_time(0, N, span) == 0.0
    assert timing.sample_time(N - 1, N, span) == pytest.approx((23 / 24) * 2.0)
    assert timing.sample_time(N - 1, N, span) < span  # never reaches the wrap point

def test_sample_time_uniform_spacing():
    span = 3.0; N = 12
    ts = [timing.sample_time(i, N, span) for i in range(N)]
    diffs = np.diff(ts)
    assert np.allclose(diffs, diffs[0])  # equal half-open slices

def test_sample_time_degenerate():
    assert timing.sample_time(0, 1, 2.0) == 0.0  # N<=1 -> 0

def test_scene_duration_from_fixture():
    """scene_duration_seconds parses duration/frameRate from a committed .motr fixture."""
    fx = os.path.join(os.path.dirname(__file__), "fixtures", "tiny.motr")
    assert timing.scene_duration_seconds(fx) == pytest.approx(2.0)  # 48 / 24

def test_scene_duration_missing_framerate_is_zero():
    fx = os.path.join(os.path.dirname(__file__), "fixtures", "tiny_nofps.motr")
    assert timing.scene_duration_seconds(fx) == 0.0

def test_scene_duration_unparseable_is_zero(tmp_path):
    bad = tmp_path / "bad.motr"; bad.write_text("not xml at all <<<")
    assert timing.scene_duration_seconds(str(bad)) == 0.0

def test_sample_time_fixture_integration():
    """End-to-end: fixture span -> 24 half-open sample times, all in [0, span)."""
    fx = os.path.join(os.path.dirname(__file__), "fixtures", "tiny.motr")
    span = timing.scene_duration_seconds(fx)
    ts = [timing.sample_time(i, config.N_FRAMES, span) for i in range(config.N_FRAMES)]
    assert ts[0] == 0.0
    assert all(0.0 <= t < span for t in ts)
    assert ts == sorted(ts)
