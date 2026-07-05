/**
 * Blend mode compositing math.
 *
 * Implements the ProCore/Motion blend modes used by the built-in transitions.
 * Separable modes follow the W3C Compositing & Blending spec (channel-wise on
 * straight [0..1] color). Stencil/Silhouette modes are non-separable alpha/luma
 * masking operations. All functions operate on straight (un-premultiplied)
 * color channels in [0..255]; alpha handling is done by the compositor.
 *
 * Enum names come from ProCore.framework's PC_BLEND_* string table.
 */
import type { BlendMode } from '../types.js';

/** Rec.709 luma of a straight RGB color in [0..255]. */
export function luma(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// --- Separable channel blend functions. Inputs cs (source) and cb (backdrop)
//     are straight color channel values in [0..255]. Return in [0..255]. ---

function chScreen(cb: number, cs: number): number {
  return 255 - ((255 - cb) * (255 - cs)) / 255;
}
function chMultiply(cb: number, cs: number): number {
  return (cb * cs) / 255;
}
function chHardLight(cb: number, cs: number): number {
  // HardLight(cb,cs) = Overlay(cs,cb)
  return cs <= 127.5 ? chMultiply(cb, 2 * cs) : chScreen(cb, 2 * cs - 255);
}
function chOverlay(cb: number, cs: number): number {
  return chHardLight(cs, cb);
}
function chSoftLight(cb: number, cs: number): number {
  // W3C soft-light, normalized to [0..1] internally.
  const b = cb / 255, s = cs / 255;
  let d: number;
  if (b <= 0.25) d = ((16 * b - 12) * b + 4) * b;
  else d = Math.sqrt(b);
  let out: number;
  if (s <= 0.5) out = b - (1 - 2 * s) * b * (1 - b);
  else out = b + (2 * s - 1) * (d - b);
  return out * 255;
}
function chColorBurn(cb: number, cs: number): number {
  if (cs === 0) return 0;
  return 255 - Math.min(255, ((255 - cb) * 255) / cs);
}
function chColorDodge(cb: number, cs: number): number {
  if (cs === 255) return 255;
  return Math.min(255, (cb * 255) / (255 - cs));
}
function chLinearDodge(cb: number, cs: number): number {
  return Math.min(255, cb + cs);
}
function chLinearBurn(cb: number, cs: number): number {
  return Math.max(0, cb + cs - 255);
}
function chLinearLight(cb: number, cs: number): number {
  // = LinearBurn/Dodge around midpoint: cb + 2*cs - 255
  return Math.max(0, Math.min(255, cb + 2 * cs - 255));
}
function chVividLight(cb: number, cs: number): number {
  if (cs <= 127.5) return chColorBurn(cb, 2 * cs);
  return chColorDodge(cb, 2 * (cs - 127.5));
}
function chPinLight(cb: number, cs: number): number {
  if (cs <= 127.5) return Math.min(cb, 2 * cs);
  return Math.max(cb, 2 * (cs - 127.5));
}
function chHardMix(cb: number, cs: number): number {
  return chVividLight(cb, cs) < 127.5 ? 0 : 255;
}

/**
 * Whether a blend mode is a separable per-channel function that can be applied
 * pixel-wise, then composited source-over. (Non-separable modes — stencil/
 * silhouette/combine — are handled specially by the compositor.)
 */
export function isSeparable(mode: BlendMode): boolean {
  return SEPARABLE_FN[mode] !== undefined;
}

type ChFn = (cb: number, cs: number) => number;

const SEPARABLE_FN: Partial<Record<BlendMode, ChFn>> = {
  multiply: chMultiply,
  screen: chScreen,
  overlay: chOverlay,
  darken: (cb, cs) => Math.min(cb, cs),
  lighten: (cb, cs) => Math.max(cb, cs),
  colorBurn: chColorBurn,
  colorDodge: chColorDodge,
  linearBurn: chLinearBurn,
  linearDodge: chLinearDodge,
  add: chLinearDodge,
  subtract: (cb, cs) => Math.max(0, cb - cs),
  difference: (cb, cs) => Math.abs(cb - cs),
  exclusion: (cb, cs) => cb + cs - (2 * cb * cs) / 255,
  softLight: chSoftLight,
  hardLight: chHardLight,
  vividLight: chVividLight,
  linearLight: chLinearLight,
  pinLight: chPinLight,
  hardMix: chHardMix,
};

/**
 * Apply the separable blend function for a mode to one channel.
 * cb=backdrop, cs=source, both [0..255].
 */
export function blendChannel(mode: BlendMode, cb: number, cs: number): number {
  const fn = SEPARABLE_FN[mode];
  return fn ? fn(cb, cs) : cs;
}
