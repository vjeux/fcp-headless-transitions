/**
 * Ground-truth PNG loader with a decode-once raw-buffer cache.
 *
 * GT frames are immutable (deterministic engine output), but the benchmark runs
 * repeatedly while iterating. Decoding a 3.5 MB PNG via pngjs (pure-JS) every run
 * dominated the benchmark (~48% of wall time). This util decodes each GT PNG ONCE
 * — using node-canvas's NATIVE (Cairo/libpng, C-level) decoder, ~1.8x faster than
 * pngjs — then writes a raw RGBA sidecar (`<png>.rgba`: u32 width, u32 height, then
 * width*height*4 bytes). Subsequent loads just readFileSync the raw bytes and wrap
 * them in an ImageData with zero decode — effectively free.
 *
 * The sidecar is invalidated if the PNG's mtime is newer than the sidecar's, so a
 * regenerated GT frame is transparently re-decoded.
 */
import fs from 'node:fs';
import { Image } from 'canvas';
import { createCanvas } from 'canvas';
import { createTransition } from '../src/index.js';
import { makeMediaResolver } from './media-resolver.js';

function decodeNative(pngPath: string): { data: Uint8ClampedArray; width: number; height: number } {
  const img = new Image();
  img.src = fs.readFileSync(pngPath);
  const w = img.width, h = img.height;
  const cv = createCanvas(w, h);
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const id = ctx.getImageData(0, 0, w, h);
  return { data: new Uint8ClampedArray(id.data.buffer.slice(0)), width: w, height: h };
}

function writeSidecar(rgbaPath: string, data: Uint8ClampedArray, w: number, h: number): void {
  const header = Buffer.alloc(8);
  header.writeUInt32LE(w, 0);
  header.writeUInt32LE(h, 4);
  const fd = fs.openSync(rgbaPath, 'w');
  try {
    fs.writeSync(fd, header);
    fs.writeSync(fd, Buffer.from(data.buffer, data.byteOffset, data.byteLength));
  } finally {
    fs.closeSync(fd);
  }
}

function readSidecar(rgbaPath: string): { data: Uint8ClampedArray; width: number; height: number } {
  const buf = fs.readFileSync(rgbaPath);
  const w = buf.readUInt32LE(0);
  const h = buf.readUInt32LE(4);
  const data = new Uint8ClampedArray(buf.buffer, buf.byteOffset + 8, w * h * 4);
  return { data, width: w, height: h };
}

/** Load a GT PNG as ImageData, using a raw `.rgba` sidecar cache (decode once). */
export function loadGT(pngPath: string): ImageData {
  const rgbaPath = pngPath + '.rgba';
  let fresh = false;
  try {
    fresh = fs.statSync(rgbaPath).mtimeMs >= fs.statSync(pngPath).mtimeMs;
  } catch { fresh = false; }

  if (fresh) {
    const { data, width, height } = readSidecar(rgbaPath);
    return new ImageData(new Uint8ClampedArray(data), width, height);
  }
  const { data, width, height } = decodeNative(pngPath);
  try { writeSidecar(rgbaPath, data, width, height); } catch { /* read-only fs: skip cache */ }
  return new ImageData(new Uint8ClampedArray(data), width, height);
}

/**
 * Create a benchmark transition from a .motr path WITH the host media resolver
 * wired in. This is the single point where the scored benchmark (scoreboard.ts,
 * compare-all.test.ts) gains a `mediaResolver`, so the media-dependent transitions
 * (Objects/Veil & Leaves' .mov overlay + luma matte, Stylized/Nature's texture.jpg
 * particle-field proxy, Lights/Light Noise's screen overlay) actually score their
 * committed engine gains instead of rendering at baseline.
 *
 * The resolver is bound to THIS .motr's directory and is a strict no-op for any
 * scene without bundled Media/ (it only returns non-null when the .motr references
 * a bundled relativeURL that exists on disk). Media-free transitions — Push, the
 * dissolves, the 360° family — never invoke it, so their scores are unchanged.
 * Missing media (e.g. an absent clip) resolves to null → the transition falls back
 * to its non-media path with no crash.
 *
 * `opts` is forwarded to createTransition (e.g. outputWidth/outputHeight so the
 * engine conforms to the GT native resolution).
 */
export function createBenchTransition(
  motrPath: string,
  opts: { outputWidth?: number; outputHeight?: number } = {}
): ReturnType<typeof createTransition> {
  const xml = fs.readFileSync(motrPath, 'utf-8');
  return createTransition(xml, { ...opts, mediaResolver: makeMediaResolver(motrPath) });
}
