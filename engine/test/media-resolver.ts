/**
 * Host-side mediaResolver for the benchmark harness.
 *
 * The core engine is environment-agnostic: it never touches the filesystem. When
 * a transition references bundled template media — Slide's rounded-rect tile PNGs,
 * Stylized/Nature's particle-field `texture.jpg`, or Objects/Veil & Leaves & Lights/
 * Light Noise's `.mov` overlays / luma mattes — the compositor emits a
 * `{type:'media', url}` source and calls back into `mediaResolver(url, timeSec?)`.
 * WITHOUT a resolver those paths are strict no-ops, so the media-dependent
 * transitions render at baseline. This module supplies the file IO:
 *
 *   - `url` is the DECODED `<relativeURL>` from the .motr (e.g. `Media/texture.jpg`,
 *     `Media/Veil.mov`, `Media/light-effect-02(screen).mov`) — resolved against the
 *     .motr's own directory to an absolute path.
 *   - Still images (.jpg/.png/.tiff): decoded once via node-canvas (native Cairo/
 *     libpng/libjpeg) and cached by absolute path.
 *   - Video (.mov): the frame at `timeSec` is extracted with ffmpeg and cached to
 *     /tmp (ffmpeg is slow — a cold decode is ~0.3–1s; the on-disk PNG cache makes
 *     re-decodes across benchmark runs effectively free). `timeSec` is the current
 *     scene time in seconds; it is clamped to the clip's duration.
 *
 * ROBUST BY DESIGN: any missing file, unreadable clip, or ffmpeg failure returns
 * `null` — the transition then falls back to its non-media path (no crash). This is
 * what lets a template with an absent asset (e.g. Curtains' missing `Sequence 3.mov`)
 * degrade gracefully rather than throw.
 *
 * The resolver only ever returns non-null for a scene that actually references
 * bundled Media/, so wiring it into the scoreboard does NOT touch media-free
 * transitions (Push, the dissolves, the 360° family, …) — they never call it.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { Image, createCanvas } from 'canvas';

const FFMPEG = process.env.FFMPEG_PATH || '/opt/homebrew/bin/ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || '/opt/homebrew/bin/ffprobe';
const CACHE_DIR = '/tmp/fct-media-cache';

if (typeof (globalThis as any).ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? data.length / 4 / width;
    }
  };
}

/** Decode any node-canvas-supported still (png/jpg/tiff) into ImageData. */
function decodeStill(absPath: string): ImageData | null {
  try {
    const img = new Image();
    img.src = fs.readFileSync(absPath);
    const w = img.width, h = img.height;
    if (!w || !h) return null;
    const cv = createCanvas(w, h);
    const cx = cv.getContext('2d');
    cx.drawImage(img, 0, 0);
    const id = cx.getImageData(0, 0, w, h);
    return new (globalThis as any).ImageData(new Uint8ClampedArray(id.data.buffer.slice(0)), w, h);
  } catch { return null; }
}

/** Video clip duration (seconds), probed once and memoized. */
const durationCache = new Map<string, number>();
function probeDuration(absPath: string): number {
  if (durationCache.has(absPath)) return durationCache.get(absPath)!;
  let dur = 0;
  try {
    const out = execFileSync(FFPROBE, [
      '-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=duration', '-of', 'default=noprint_wrappers=1:nokey=1', absPath,
    ], { encoding: 'utf-8' }).trim();
    dur = parseFloat(out) || 0;
  } catch { dur = 0; }
  durationCache.set(absPath, dur);
  return dur;
}

/**
 * Extract the video frame nearest `timeSec` to a cached PNG (keyed by clip mtime,
 * size, and a 40 ms time bucket so nearby scene times reuse a decode), then decode
 * it via node-canvas. Returns null on any ffmpeg/decode failure.
 */
function decodeVideoFrame(absPath: string, timeSec: number): ImageData | null {
  try {
    const dur = probeDuration(absPath);
    let t = timeSec;
    if (dur > 0) t = Math.max(0, Math.min(t, dur - 1e-3));
    else if (t < 0) t = 0;
    // 40 ms buckets (≈ finer than any clip's frame interval) keep the cache bounded.
    const bucket = Math.round(t / 0.04) * 0.04;
    const st = fs.statSync(absPath);
    const key = crypto.createHash('md5')
      .update(`${absPath}|${st.size}|${st.mtimeMs}|${bucket.toFixed(3)}`).digest('hex');
    const pngPath = path.join(CACHE_DIR, `${key}.png`);
    if (!fs.existsSync(pngPath)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      // -ss before -i = fast keyframe seek; accurate enough for a proxy overlay.
      execFileSync(FFMPEG, [
        '-nostdin', '-loglevel', 'error', '-y',
        '-ss', bucket.toFixed(3), '-i', absPath,
        '-frames:v', '1', '-f', 'image2', pngPath,
      ], { stdio: ['ignore', 'ignore', 'ignore'] });
    }
    if (!fs.existsSync(pngPath)) return null;
    return decodeStill(pngPath);
  } catch { return null; }
}

/** Still-image decode cache (per absolute path — bundled stills never change). */
const stillCache = new Map<string, ImageData | null>();

/**
 * Build a mediaResolver bound to a specific .motr path. Resolves the .motr's
 * bundled `<relativeURL>` media (relative to the .motr's own directory).
 *
 * VIDEO TIME MAPPING. The compositor threads the *un-wrapped* scene time to the
 * resolver (monotonic 0 → transition duration; see index.ts mediaTime), which for
 * the Objects/Lights .mov clips matches the clip's own duration. FCP plays these
 * overlay/matte clips FORWARD — transition progress 0 = the clip's FIRST frame,
 * progress 1 = its LAST — so `clipTime = timeSec` directly.
 *
 * (History: an earlier assumption that these "un-fall" — progress 0 = clip LAST
 * frame — set `reverse` true by default. That was measured WRONG against the GUI
 * GT: forward playback scores Objects/Veil 9.51→15.86 (+6.35), Objects/Leaves
 * 12.42→16.56 (+4.14), Objects/Curtains 14.15→14.96 (+0.81), and is gate-neutral on
 * the retime-driven overlays (Light Noise −0.06, Static −0.16, Light Sweep −0.11,
 * all ≪ the 0.30 tol). The Veil - Wipe Matte's own clip carries `Reverse=0`,
 * confirming forward. The `reverseVideo` opt is kept for callers that truly need a
 * reversed clip, but the DEFAULT is now forward.) Still images ignore time.
 */
export function makeMediaResolver(
  motrPath: string,
  opts: { reverseVideo?: boolean } = {}
): (url: string, timeSec?: number, absolute?: boolean) => ImageData | null {
  const reverse = opts.reverseVideo === true; // default FORWARD (measured better vs GUI GT)
  const motrDir = path.dirname(motrPath);
  return (url: string, timeSec?: number, absolute?: boolean): ImageData | null => {
    if (!url) return null;
    // The parser already URL-decodes relativeURL; decode again defensively (no-op
    // if already decoded) so a raw %20 path still resolves.
    let rel = url;
    try { rel = decodeURIComponent(url); } catch { /* keep raw */ }
    const abs = path.isAbsolute(rel) ? rel : path.resolve(motrDir, rel);
    if (!fs.existsSync(abs)) return null;
    const ext = path.extname(abs).toLowerCase();
    if (ext === '.mov' || ext === '.mp4' || ext === '.m4v' || ext === '.qt') {
      let t = timeSec ?? 0;
      // `absolute` = the compositor computed a forward clip time from the layer's
      // Retime Value curve (clip-frame numbers); seek there directly, no reverse.
      if (reverse && !absolute) {
        const dur = probeDuration(abs);
        if (dur > 0) t = Math.max(0, dur - t);
      }
      return decodeVideoFrame(abs, t);
    }
    // Still image (.jpg/.jpeg/.png/.tiff/.tif/.gif/…).
    if (stillCache.has(abs)) return stillCache.get(abs)!;
    const img = decodeStill(abs);
    stillCache.set(abs, img);
    return img;
  };
}
