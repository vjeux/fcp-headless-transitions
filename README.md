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
| `images/`       | Example source images. |

## Using a different transition

Point `MOTR` in `render.py` at another `.motr`. If the new template's two drop-zone
`OZImageElement` scene IDs differ from the Push template's, update `DROPZONE_A_ID` /
`DROPZONE_B_ID`. Everything else is transition-agnostic.

## Caveats

- Reverse-engineered against a specific Final Cut Pro build; hardcoded symbol names and
  struct offsets (e.g. `params+0x3e0`, the `−0x10` element base offset) may shift between
  versions.
- Uses private frameworks and runtime code patching — for research / ground-truth use.

## License

MIT
