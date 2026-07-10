# fct — the single toolkit

Replaces ~160 ad-hoc scripts. Four responsibilities, ONE way to do each.
Everything reads/writes PNG files on disk; no in-memory frame passing between stages.

## Run
```
./fct.sh <command> ...        # or: python3 fct/cli.py <command> ...
```
Headless auto-re-execs under `venv/bin/python3` with `DYLD_FRAMEWORK_PATH` set
(SIP strips DYLD from child processes, so it execs rather than spawns).

## Commands
```
fct gen  <gui|headless|engine> [slug ...|--all]   generate 24 frames/slug to disk
fct read <file.png>                               read one frame -> shape/mean
fct cmp  <a.png> <b.png> [--color-b bt709] [--out diff.png]   compare two files
fct score [slug ...|--all] [--source headless|engine] [--frames]   score vs GUI GT
fct montage [slug ...|--all] [--sources gui,headless,engine] [--out m.mp4]
```

## The one truth
`~/fct-gui-gt/<slug>/` (sliced from the recorded FCP GUI capture) is the ONLY
ground truth. NEVER score a render against another render's output — that is
circular (it caused the false "at ceiling" verdicts). `fct score` compares only
against the GUI GT.

## Frame layout (identical for all three sources)
```
~/fct-gui-gt/<slug>/frame_0000..0023.png        GUI ground truth (bt709)
~/fct-frames/headless/<slug>/frame_*.png        FCP headless shim (sRGB)
~/fct-frames/engine/<slug>/frame_*.png          TS engine (sRGB)
```
24 frames, half-open cadence `t = (i/24) * scene_duration` (fct.timing), 1920x1080.
Color model (sRGB->bt709) lives in fct.color; applied to headless/engine before
comparing to the GUI GT.

## Modules
| file | role |
|---|---|
| config.py   | paths, constants, slug map (single source of truth) |
| timing.py   | scene_duration_seconds + sample_time (the cadence) |
| gen.py      | render frames: gen_headless (FCP shim), gen_engine (TS) |
| slice_gui.py| slice GUI GT from GT_ALL_65.mov |
| read.py     | read_frame — the one disk-read |
| color.py    | to_bt709 — the one color transform |
| compare.py  | compare — the one two-file comparison |
| score.py    | score — source vs GUI GT (the one scoring path) |
| montage.py  | montage — the one video builder |
| cli.py      | the one entrypoint |

## Dependencies
`fct.gen` calls `tools/ozengine.py` (the raw FCP engine binding) and the TS engine
in `engine/`. Nothing else. `render_gt.py` and the old scripts are deleted.
