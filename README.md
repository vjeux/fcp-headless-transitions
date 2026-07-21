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

Everything goes through one tool, `fct` (see [fct/README.md](fct/README.md)):

```bash
./fct.sh gen headless Movements__Push   # render one transition's frames to disk
./fct.sh gen engine   Movements__Push   # render the same via the browser engine
./fct.sh gen gui      Movements__Push   # slice the GUI ground truth from the capture
./fct.sh score        Movements__Push   # PSNR of headless vs the GUI ground truth
./fct.sh montage      Movements__Push   # stacked GUI | headless | engine video
```

`fct gen` writes 24 frames per transition (`frame_0000.png …`) at the half-open
cadence `t = (i/24)·span`, 1920×1080, to a canonical per-source directory. Headless
auto-re-execs under the venv with `DYLD_FRAMEWORK_PATH` set so FCP's sibling
frameworks resolve at load time.

## Render *every* built-in transition

`fct gen headless --all` discovers all `.motr` transition templates bundled with Final
Cut Pro and renders each one (in an isolated subprocess, so one bad template — or the
engine's harmless teardown crash — can't abort the batch):

```bash
./fct.sh gen headless --all
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
| `fct/`          | **The toolkit** — one CLI for generating frames (gui/headless/engine), reading, comparing, scoring, and montaging. Run via `./fct.sh`. See [fct/README.md](fct/README.md). |
| `fct.sh`        | Entry point for `fct`. |
| `images/`       | Example source images. |
| `engine/`       | **`motr-engine`** — a from-scratch TypeScript reimplementation of the Motion transition engine, for running these transitions in the browser (see below). |
| `tools/`        | Low-level engine binding: `ozengine.py` (FCP engine boot + `render_frame`), `fcp_constants.py` (canonical timescale), `bootstrap_worktree.sh`. `fct` drives these. |
| `docs/GALLERY.md`  | Animated previews of all supported transitions. |
| `docs/DEBUGGING.md` | **How to validate the browser engine against real FCP, pixel-for-pixel.** Read this first if you're working on `engine/`. |
| `docs/types/`   | **Type reference** — human-authored docs for the Motion type system (filters, components, behaviors) built from a 5,300-file template corpus. Start at [docs/types/README.md](docs/types/README.md). |
| `docs/filters/` | Per-filter parameter reference: the top 50 filters by corpus usage, each with what it does, its real (de-plumbed) parameters, correct types, and implementation status. |

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

### Validation tools

All validation flows through the `fct` toolkit (see [fct/README.md](fct/README.md)):

| Command | Purpose |
|------|---------|
| `fct gen gui <slug>` | Slice the screen-recorded FCP **GUI** export (`GT_ALL_65.mov`) into 24 per-transition frames — the **ground truth**. |
| `fct gen headless <slug>` | Render the same transition through FCP's real engine in-process (`tools/ozengine.py`). |
| `fct gen engine <slug>` | Render it through the from-scratch TS engine. |
| `fct cmp <a.png> <b.png>` | Compare two frames on disk (PSNR + diff image). |
| `fct score <slug>` | Per-frame + mean PSNR of a render vs the GUI ground truth. |
| `fct montage <slug\|--all>` | Stacked GUI \| headless \| engine comparison video. |

Deep `.motr` reverse-engineering helpers (curve dumping, ruler-based sub-pixel
measurement, lldb probes) live in the git history and `docs/DEBUGGING.md`; the
day-to-day workflow is the `fct` commands above.

### Scoring against ground truth

The **only** ground truth is the GUI export (`~/fct-gui-gt/`, sliced by `fct gen gui`
from `GT_ALL_65.mov`). `fct score` reports per-frame + mean PSNR of a render against it,
over 24 frames at the half-open cadence `t = (i/24)·span` (frame 0 is pure A; frame 24
would be the wrap point back to A — never rendered; the frames are `i = 0..23`). The
render is color-conformed (sRGB→bt709, `fct.color`) before comparison.

> Do **not** score a render against another render's output — that is circular. Truth is
> the GUI GT only. (`docs/SCOREBOARD.md` may contain older numbers from a superseded
> methodology; regenerate with `fct score --all`.)

## Using a different transition

Pass any slug to `fct gen` (`./fct.sh gen headless <slug>`). The two source drop-zones
are matched by authored drop-zone identity at render time (via the media-ref hook), so
no per-template IDs are needed — the renderer is transition-agnostic. `fct gen
headless --all` uses exactly this to sweep the whole library.

## Caveats

- Reverse-engineered against a specific Final Cut Pro build; hardcoded symbol names and
  struct offsets (e.g. `params+0x3e0`, the `−0x10` element base offset) may shift between
  versions.
- Uses private frameworks and runtime code patching — for research / ground-truth use.

## License

MIT
