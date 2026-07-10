/**
 * Parser — blend mode, retime value, and transform extraction.
 *
 * Pure param-tree processing (no DOM): maps the PC_BLEND_* enum to BlendMode, pulls
 * the Retime Value curve, and reads Position/Rotation/Scale/Anchor/Shear/Opacity/Crop
 * into a Transform. Split out of parser/index.ts (ROADMAP item 7).
 */
import type { BlendMode, Curve, Transform, Parameter } from '../types.js';

/**
 * PC_BLEND_* enum → BlendMode name.
 *
 * Reverse-engineered from ProCore.framework's ordered PC_BLEND string table
 * (__TEXT,__cstring). The integer values of the .motr "Blend Mode" parameter
 * (id=203 or 227) index directly into this table — SEPARATOR entries occupy
 * indices too (that's why Add=8 not 5, Overlay=14 not 11, etc.).
 *
 * Ordered table (index : PC_BLEND name):
 *   0 NORMAL, 1 SEPARATOR0, 2 SUBTRACT, 3 DARKEN, 4 MULTIPLY, 5 COLOR_BURN,
 *   6 LINEAR_BURN, 7 SEPARATOR1, 8 ADD, 9 LIGHTEN, 10 SCREEN, 11 COLOR_DODGE,
 *   12 LINEAR_DODGE, 13 SEPARATOR2, 14 OVERLAY, 15 SOFT_LIGHT, 16 HARD_LIGHT,
 *   17 VIVID_LIGHT, 18 LINEAR_LIGHT, 19 PIN_LIGHT, 20 HARD_MIX, 21 SEPARATOR3,
 *   22 DIFFERENCE, 23 EXCLUSION, 24 SEPARATOR4, 25 STENCIL_ALPHA,
 *   26 STENCIL_LUMA, 27 SILHOUETTE_ALPHA, 28 SILHOUETTE_LUMA, 29 BEHIND,
 *   30 SEPARATOR5, 31 ALPHA_ADD, 32 LUMINESCENT_PREMUL, 33 SEPARATOR6,
 *   34 COMBINE, 35 LIGHT_WRAP
 *
 * Confirmed: value 28 (Silhouette Luma) on 360° Push measurably improves PSNR.
 * Every blend value observed across the built-in transitions (0,4,5,8,10,14,
 * 15,16,17,25,27,28,34) lands on a real (non-separator) mode.
 */
const BLEND_MODE_ENUM: Record<number, BlendMode> = {
  0: 'normal',
  2: 'subtract',
  3: 'darken',
  4: 'multiply',
  5: 'colorBurn',
  6: 'linearBurn',
  8: 'add',
  9: 'lighten',
  10: 'screen',
  11: 'colorDodge',
  12: 'linearDodge',
  14: 'overlay',
  15: 'softLight',
  16: 'hardLight',
  17: 'vividLight',
  18: 'linearLight',
  19: 'pinLight',
  20: 'hardMix',
  22: 'difference',
  23: 'exclusion',
  25: 'stencilAlpha',
  26: 'stencilLuma',
  27: 'silhouetteAlpha',
  28: 'silhouetteLuma',
  29: 'behind',
  31: 'alphaAdd',
  32: 'luminescentPremul',
  34: 'combine',
  35: 'lightWrap',
};

/**
 * Extract the layer Blend Mode from its parameter tree.
 * Lives at Properties(id=1) > Blending(id=200) > Blend Mode(id=203 or 227).
 * Returns 'normal' when absent or when the value maps to an unknown/separator index.
 */
export function extractBlendMode(params: Parameter[]): BlendMode {
  function find(ps: Parameter[]): number | undefined {
    for (const p of ps) {
      if (p.name === 'Blend Mode' && (p.id === 203 || p.id === 227) && typeof p.value === 'number') {
        return p.value;
      }
      if (p.children) {
        const r = find(p.children);
        if (r !== undefined) return r;
      }
    }
    return undefined;
  }
  const v = find(params);
  if (v === undefined) return 'normal';
  // Test/ablation hook: FCT_DISABLE_BLEND forces source-over to measure the
  // blend-mode delta. Never set in normal operation.
  if (typeof process !== 'undefined' && process.env?.FCT_DISABLE_BLEND) return 'normal';
  return BLEND_MODE_ENUM[v] ?? 'normal';
}


// ============================================================================
// Transform Extraction
// ============================================================================

/**
 * Extract transform values from a parameter tree.
 * Motion's standard layout:
 *   Properties (id=1)
 *     Transform (id=100)
 *       Position (id=101): X(1), Y(2), Z(3)
 *       Rotation (id=102): X(1), Y(2), Z(3) [or single value for 2D]
 *       Scale (id=103): X(1)=%, Y(2)=%, Z(3)=%
 *       Anchor Point (id=106): X(1), Y(2), Z(3)
 *       Shear (id=105): X(1), Y(2)
 *     Blending (id=200)
 *       Opacity (id=202): value 0-100
 *     Crop (id=500)
 *       Left(1), Right(2), Top(3), Bottom(4)
 */
export function extractRetimeValue(params: Parameter[]): Curve | undefined {
  // Retime Value is at params > Properties > Retime Value (id=304 typically)
  function findCurve(ps: Parameter[], name: string): Curve | undefined {
    for (const p of ps) {
      if (p.name === name && p.curve) return p.curve;
      if (p.children) {
        const found = findCurve(p.children, name);
        if (found) return found;
      }
    }
    return undefined;
  }
  return findCurve(params, 'Retime Value');
}

export function extractTransform(params: Parameter[]): Transform {
  const tx: Transform = {};

  function findParam(params: Parameter[], name: string, id?: number): Parameter | undefined {
    for (const p of params) {
      if (p.name === name && (id === undefined || p.id === id)) return p;
      if (p.children) {
        const found = findParam(p.children, name, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  function getAnimValue(params: Parameter[], name: string, id?: number): Curve | number | undefined {
    const p = findParam(params, name, id);
    if (!p) return undefined;
    if (p.curve) return p.curve;
    if (typeof p.value === 'number') return p.value;
    return undefined;
  }

  // Position
  const posParam = findParam(params, 'Position');
  if (posParam?.children) {
    tx.positionX = getAnimValue(posParam.children, 'X') ?? getAnimValue(posParam.children, 'X', 1);
    tx.positionY = getAnimValue(posParam.children, 'Y') ?? getAnimValue(posParam.children, 'Y', 2);
    tx.positionZ = getAnimValue(posParam.children, 'Z') ?? getAnimValue(posParam.children, 'Z', 3);
  }

  // Rotation
  const rotParam = findParam(params, 'Rotation');
  if (rotParam?.children) {
    tx.rotationZ = getAnimValue(rotParam.children, 'Z') ?? getAnimValue(rotParam.children, 'Z', 3);
    tx.rotationX = getAnimValue(rotParam.children, 'X') ?? getAnimValue(rotParam.children, 'X', 1);
    tx.rotationY = getAnimValue(rotParam.children, 'Y') ?? getAnimValue(rotParam.children, 'Y', 2);
  } else if (rotParam) {
    // Single rotation value = Z rotation
    tx.rotationZ = rotParam.curve ?? (typeof rotParam.value === 'number' ? rotParam.value : undefined);
  }

  // Scale (in percent)
  const scaleParam = findParam(params, 'Scale');
  if (scaleParam?.children) {
    tx.scaleX = getAnimValue(scaleParam.children, 'X') ?? getAnimValue(scaleParam.children, 'X', 1);
    tx.scaleY = getAnimValue(scaleParam.children, 'Y') ?? getAnimValue(scaleParam.children, 'Y', 2);
    tx.scaleZ = getAnimValue(scaleParam.children, 'Z') ?? getAnimValue(scaleParam.children, 'Z', 3);
  }

  // Anchor Point
  const anchorParam = findParam(params, 'Anchor Point');
  if (anchorParam?.children) {
    tx.anchorX = getAnimValue(anchorParam.children, 'X') ?? getAnimValue(anchorParam.children, 'X', 1);
    tx.anchorY = getAnimValue(anchorParam.children, 'Y') ?? getAnimValue(anchorParam.children, 'Y', 2);
    tx.anchorZ = getAnimValue(anchorParam.children, 'Z') ?? getAnimValue(anchorParam.children, 'Z', 3);
  }

  // Opacity (0-100 in Motion → 0-1 for compositing). The layer's own opacity is
  // ALWAYS the Properties param id=202. Constrain by id so we don't accidentally
  // grab a nested "Opacity" (e.g. Drop Shadow > Opacity id=211, default 0.75),
  // which would darken the whole layer.
  const opacityParam = findParam(params, 'Opacity', 202);
  if (opacityParam) {
    tx.opacity = opacityParam.curve ?? (typeof opacityParam.value === 'number' ? opacityParam.value : undefined);
  }

  // Crop
  const cropParam = findParam(params, 'Crop');
  if (cropParam?.children) {
    tx.cropLeft = getAnimValue(cropParam.children, 'Left') ?? getAnimValue(cropParam.children, 'Left', 1);
    tx.cropRight = getAnimValue(cropParam.children, 'Right') ?? getAnimValue(cropParam.children, 'Right', 2);
    tx.cropTop = getAnimValue(cropParam.children, 'Top') ?? getAnimValue(cropParam.children, 'Top', 3);
    tx.cropBottom = getAnimValue(cropParam.children, 'Bottom') ?? getAnimValue(cropParam.children, 'Bottom', 4);
  }

  return tx;
}
