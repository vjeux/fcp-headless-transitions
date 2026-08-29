import { PCRect_double } from "../infra/PCRect_double.js";

/**
 * `OZLight` — only the claimed secondary-base thunk is represented here.
 * The thunk does not inspect the adjusted `this` pointer.
 */
export class OZLight {}

/**
 * Non-virtual thunk to
 * `OZLight::getBounds(PCRect<double>*, OZRenderState const&)`
 * @Ozone 0x483b10
 * (__ZThn6520_N7OZLight9getBoundsEP6PCRectIdERK13OZRenderState)
 *
 * The `Thn6520` entry receives `this` at the +0x1978 secondary subobject, but
 * its inlined body never reads that pointer. It writes two packed f64 pairs to
 * the output rectangle and ignores the render state:
 *
 *   0x483b14  movaps Ozone[0x70dad0], %xmm0  // {-50.0, -50.0}
 *   0x483b1b  movups %xmm0, 0x00(%rsi)       // output origin
 *   0x483b1e  movaps Ozone[0x70dac0], %xmm0  // {100.0, 100.0}
 *   0x483b25  movups %xmm0, 0x10(%rsi)       // output size
 *
 * Constant bytes from the x86_64 image:
 *   @Ozone 0x70dad0: 00000000000049c0 00000000000049c0
 *   @Ozone 0x70dac0: 0000000000005940 0000000000005940
 */
export function OZLight_getBounds__Thn6520(
  _selfAtSecondaryBase: OZLight,
  out: PCRect_double,
  _renderState: unknown,
): void {
  // @0x483b14..0x483b1b — store {-50.0, -50.0} at out+0x00.
  out.origin_x_at_0x0 = -50;
  out.origin_y_at_0x8 = -50;

  // @0x483b1e..0x483b25 — store {100.0, 100.0} at out+0x10.
  out.size_w_at_0x10 = 100;
  out.size_h_at_0x18 = 100;
}
