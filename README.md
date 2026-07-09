# fcp-headless-transitions

Render Final Cut Pro / Motion transitions **headlessly** — driving FCP's *real* Motion
render engine (`Ozone.framework`) from a standalone process, with **no GUI, no
Compressor, and no media server**.

Give it two images and it composites them through a built-in Motion transition (Push,
by default) exactly as Final Cut Pro would, writing out a PNG sequence (and optionally
an `mp4`). Built as ground truth for validating a from-scratch browser Motion renderer.

![Push transition demo](docs/demo.gif)

*Above: the built-in **Push** transition between two photos, rendered entirely headless
by FCP's Motion engine.*

![keyframes](docs/demo_montage.png)

## Why this is unusual

Final Cut Pro has **no scripting API for rendering** — its AppleScript dictionary only
exposes `get`, and there is no `--render` CLI. The only supported way to export is the
GUI Share sheet. This project instead loads Motion's actual render engine
(`Ozone.framework`, shared between FCP and Motion) directly into a process and drives it
programmatically, so you get pixel-for-pixel real-engine output with zero UI.

## Requirements

- macOS (Apple Silicon) with **Final Cut Pro** installed at `/Applications/Final Cut Pro.app`
- Xcode command-line tools (`clang++`)
- Python 3 with **pyobjc**
- `ffmpeg` — optional, only for `--mp4`

## Setup

```bash
# 1) Python venv with pyobjc
python3 -m venv venv
./venv/bin/pip install pyobjc-core pyobjc-framework-Cocoa pyobjc-framework-Quartz

# 2) Build the renderer dylib against FCP's frameworks
./build.sh
```

## Usage

```bash
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
DYLD_FRAMEWORK_PATH="$FW" ./venv/bin/python render.py \
    images/start.jpg images/end.jpg out \
    --frames 48 --mp4 out/push.mp4
```

- `out/frame_0000.png …` — the rendered frames
- `out/push.mp4` — assembled video (with `--mp4`)

Options: `--frames N`, `--duration SECS`, `--fps N`, `--motr PATH`, `--mp4 PATH`.

> `DYLD_FRAMEWORK_PATH` must point at FCP's `Frameworks` dir so the engine's sibling
> frameworks resolve at load time.

## Render *every* built-in transition

`run_all.py` discovers all `.motr` transition templates bundled with Final Cut Pro and
renders each one (in an isolated subprocess, so one bad template can't abort the batch):

```bash
./venv/bin/python run_all.py images/start.jpg images/end.jpg all_out --frames 24
```

**All 65 built-in transitions render successfully.** See the full
**[transition gallery](docs/GALLERY.md)** for animated previews of every one.


## How it works

1. **Boot the engine headless.** Load `Ozone.framework` in-process and initialize its
   singleton via Apple's own `OZSharedApplicationForAllUnitTests` test entry point
   (without it, document creation segfaults). Make the master GL context current.
2. **Load the transition.** Open the Push `.motr` as an `OZObjCDocument`
   (type `com.apple.motion.transition`) and grab the underlying C++ `OZScene`.
3. **Set up the GPU.** Acquire the system Metal device, construct an `HGGPURenderer`
   from its registry ID, and prepare an `OZRenderParams` via `OZX_prepareForRender`.
4. **Decode the inputs.** Turn each image into a Motion render-graph bitmap node
   (`PGHelium::createBitmapNode`), centered on the frame.
5. **Inject the images.** A transition's two sources are drop-zones whose footage is
   normally decoded through the `PMClip` media pipeline — which isn't available headless.
   So we install a **runtime hook** over `OZImageElement::getHeliumGraphFromMediaRef`
   (a 16-byte `LDR x16 / BR x16 / .quad` trampoline, with the code page toggled RW→RX)
   that returns our image nodes at the exact point the engine asks each drop-zone for
   its media graph.
6. **Render.** Build the render graph (`OZXGetRenderGraph`) and rasterize each frame
   (`PGHelium::renderNodeToBitmap`) into a 16-bit buffer, then write a PNG.

All argument marshalling matches FCP's real ABI (including arm64 `x8` struct-returns and
by-pointer passing of `shared_ptr`/`CMTime`/matrices).

## Files

| File            | Purpose |
|-----------------|---------|
| `oz_render.mm`  | The renderer: engine bootstrap, GPU setup, image nodes, media-ref hook, rasterize→PNG. |
| `build.sh`      | Compiles `oz_render.mm` → `oz_render.dylib`. |
| `render.py`     | Driver: boots the engine, loads the `.motr`, renders frames, assembles mp4. |
| `run_all.py`    | Discovers and renders every built-in FCP transition (subprocess-isolated). |
| `images/`       | Example source images. |
| `engine/`       | **`motr-engine`** — a from-scratch TypeScript reimplementation of the Motion transition engine, for running these transitions in the browser (see below). |
| `tools/`        | Ground-truth + validation helpers: `ozengine.py` (engine boot), `render_gt.py` (headless GT), `slice_gui_gt.py` (GUI GT from a screen recording), plus sub-pixel measurement, `.motr` editing, lldb reverse-engineering, and video generation. See the table below. |
| `docs/GALLERY.md`  | Animated previews of all supported transitions. |
| `docs/DEBUGGING.md` | **How to validate the browser engine against real FCP, pixel-for-pixel.** Read this first if you're working on `engine/`. |

## The browser engine (`engine/`)

`engine/` is a clean-room TypeScript renderer that reproduces FCP/Motion transitions
without any Apple frameworks, so they can run in a browser. The headless renderer
above is its **ground truth**: we render a transition through FCP's real engine, then
diff the browser engine against it frame-by-frame.

```bash
cd engine && npm install
node_modules/.bin/tsx test/push-compare.ts        # PSNR vs committed ground truth
node_modules/.bin/tsx test/all-transitions.test.ts # all 65 parse + render, 0 crashes
```

Getting a transition **pixel-perfect** took reverse-engineering Motion's exact curve
interpolation (it ignores the tangent handles stored in the `.motr` and recomputes
Catmull-Rom tangents with a specific handle-time rule) — the full methodology, tools,
and findings are in **[docs/DEBUGGING.md](docs/DEBUGGING.md)**.

### Validation tools (`tools/`)

| Tool | Purpose |
|------|---------|
| `tools/ozengine.py` | Shared headless-engine boot boilerplate: `init_engine()` / `load_doc()` / `render_frame()`. Boot the engine once, render many transitions in one process. Every GT/probe script imports it. |
| `tools/render_gt.py` | Render *headless* ground-truth frames through the real engine over the transition's authored scene duration (half-open `i/N` time slices). `--push OUTDIR [N]` renders the default Push demo. |
| `tools/slice_gui_gt.py` | Slice a screen-recorded FCP **GUI** export (`GT_ALL_65.mov`) into per-transition frames — the *second* ground truth. Detects each transition's B-settle frame per-slug and resamples its true extent to 24 frames using the same half-open `i/N` convention as the headless scorer. |
| `tools/make_ruler.py` / `decode_ruler.py` | Row-encoded "ruler" images for sub-pixel (≈0.5 px) motion measurement. |
| `tools/edit_curve.py` | Patch a `.motr` keyframe curve to test interpolation hypotheses through the real engine. |
| `tools/lldb_capture_curve.py` + `curve_probe.py` | lldb driver that dumps the exact Bézier control polygons the engine builds per segment. |
| `tools/make_videos.py` | Build all comparison/diff videos + contact sheets from a GT dir + engine dir. |
| `tools/analyze_segments.py` / `survey_catalog.py` | Detect per-slug settle windows (feeds `slice_gui_gt.py`) and survey the `.motr` template catalog. |

### Scoring against ground truth

The scoreboard ([docs/SCOREBOARD.md](docs/SCOREBOARD.md)) reports the TS engine's mean
PSNR vs FCP over up to 24 frames per transition (progress `i/23`), engine output
conformed to GT-native 1920×1080. Two ground-truth sources are used:

- **Headless GT** — `tools/render_gt.py` (FCP's engine in-process, this repo).
- **GUI GT** — `tools/slice_gui_gt.py` (frames sliced from a real FCP GUI export).

Both use the same half-open `i/N` time sampling, so the engine can be scored against
either. Regenerate the batch headless GT with `run_all.py` (see the engine
`ground-truth` npm script) and re-run `engine/test/scoreboard.ts`.

## Using a different transition

Pass `--motr PATH` to `render.py` (or edit the `MOTR` default) to point at another
`.motr`. The two source drop-zones are matched by discovery order at render time (via
the media-ref hook), so no per-template IDs are needed — the renderer is
transition-agnostic. `run_all.py` uses exactly this to sweep the whole library.

## Caveats

- Reverse-engineered against a specific Final Cut Pro build; hardcoded symbol names and
  struct offsets (e.g. `params+0x3e0`, the `−0x10` element base offset) may shift between
  versions.
- Uses private frameworks and runtime code patching — for research / ground-truth use.

## License

MIT
