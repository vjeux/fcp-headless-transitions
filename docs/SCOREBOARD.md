# FCP Transition Benchmark Scoreboard

Mean PSNR of a render (headless or the TS `engine/`) vs Final Cut Pro's **GUI
reference** — the only ground truth (`~/fct-gui-gt/<slug>/`).

There is no static table here: scores move whenever a fix lands, and stale copied
numbers caused real confusion in the past. Generate live numbers with the toolkit:

```bash
./fct.sh gen headless --all     # render all 65 through FCP's real engine
./fct.sh score --all            # per-slug mean PSNR vs the GUI GT
./fct.sh score Movements__Push --frames   # one slug, per-frame breakdown
```

## Methodology

- **24 frames** per transition at the half-open cadence `t = (i/24)·scene_duration`
  (`fct.timing`); frame 0 is pure A, frame 24 is the wrap point (never rendered).
- Source images `images/start.jpg` / `images/end.jpg`, output 1920×1080.
- The render (sRGB) is color-conformed to the GUI GT (bt709) via `fct.color`
  (R:1.095/0.977 G:1.070/0.963 B:1.074/0.966) before comparison.
- **Truth is the GUI GT only.** Never score a render against another render's output —
  that is circular. (An earlier "headless-vs-headless ceiling" comparison did exactly
  this and produced false "at ceiling" verdicts; see `fct/README.md`.)

Visual check across all three renderers: `./fct.sh montage --all`.
