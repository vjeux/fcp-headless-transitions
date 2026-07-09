"""Canonical FCP Motion render constants — SIDE-EFFECT-FREE literals only.

This module is the single source of truth for the render timescale and scene
duration used across the headless FCP transition pipeline. It contains ONLY
literal constants and NO imports of ozengine, NO ctypes, and NO engine boot,
so it is safe to import from ANYWHERE — including the standalone,
subprocess-isolated drivers/workers (render.py, run_all.py) that must never
import ozengine (importing ozengine has engine-boot side effects at import
time).

Values must stay EXACTLY these:
    TIMESCALE       = 24000     (ticks/sec; FCP authors transitions at
                                 24000/1001 fps == 23.976 fps, with a
                                 1001-tick frame)
    SCENE_DURATION  = 2.002     (seconds; two 1.001s stills)
    FPS             = TIMESCALE / 1001  (== 24000/1001 == 23.976 fps)
"""

# ticks/sec for the FCP Motion engine (24000/1001 fps -> 1001-tick frame).
TIMESCALE = 24000

# scene length in seconds (two 1.001s stills, 23.976 fps).
SCENE_DURATION = 2.002

# derived frame rate: 24000/1001 == 23.976 fps.
FPS = TIMESCALE / 1001
