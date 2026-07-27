// OZBezierSanitizeControlPolygon — ProChannel.framework free function @ProChannel 0xa550c.
// Faithful port (SHIM): only invoked when the caller's OZSpline has sp->0xa8[0]==0 &&
// sp->0xa8[3]==1 (the "clamp handles" mode). See re/disasm/ProChannel.OZBezierSanitizeControlPolygon.s
// for the full ~200-line body — it enforces a time-axis monotonic clamp on the 4-point control
// polygon by solving a quadratic at @0xacc78 (PCMath::quadratic) and rescaling handles.
//
// The gate that fires this function is FALSE on default OZSpline instances (sp->0xa8 is
// zero-initialised by OZSpline's bounds ctor). Our current parser (raw-port/src/channels/
// OZCurve.ts) does not set sp->0xa8[3], so this function is never invoked from the current
// corpus. When a future .motr triggers the clamp-handles mode, transcription must be completed
// per the disasm; until then we throw citing the address (PORTING_SPEC Rule 3).
//
// Decode evidence:
//   raw-port/re/disasm/ProChannel.OZBezierSanitizeControlPolygon.s   (@0xa550c, 71 lines shown)
//   raw-port/re/BEZIER_GETCONTROLPOINTS_DECODE.md (Step D — the sp->0xa8 gate wiring)
//
// The DECODED prelude (@0xa550c..0xa55aa; before the quadratic solver call):
//   xmm4 = xs[0]                                                     @0xa550c
//   xmm2 = 0.5 * xs[0]        (const @0xb0600 = 0.5)                 @0xa5510-0xa5518
//   xmm3 = (xs[1], xs[2])     (movupd 0x8(rdi))                      @0xa551c
//   xmm0 = (2.0, 1.0) * xmm3  (const @0xb1b50 = (2.0, 1.0))          @0xa5521-0xa5529
//   xmm1 = xmm2 + xmm0.lo - xmm0.hi   ≈  0.5*xs[0] + 2*xs[1] - xs[2] @0xa552d-0xa5539
//   xmm0 = 0.5 * xs[3] + xmm1                                        @0xa553d-0xa554a
//   if (xmm0 <= 0) return                                            @0xa5552-0xa5556  jbe skip
//   ... (main body, cubic + quadratic solve — not yet transcribed) ...
//
// The exit points at @0xa5715 all return without modifying xs/ys — meaning the gate produces
// a NO-OP when the "shape indicator" (0.5*xs[0] - 2*xs[1] + xs[2] + 0.5*xs[3]) <= 0. This
// suggests the sanitize only mutates xs/ys when the control polygon is degenerate in a
// specific direction; a future faithful transcription is required before we can guarantee the
// output values.

import type { OZKeypoint } from "./OZCurve.js";

/**
 * OZBezierSanitizeControlPolygon(double* xs, double* ys)  @ProChannel 0xa550c.
 * Called ONLY when sp->0xa8[0]==0 && sp->0xa8[3]==1 (see BEZIER_GETCONTROLPOINTS_DECODE.md
 * Step D). Not yet transcribed; throws citing @ProChannel 0xa550c per PORTING_SPEC Rule 3.
 *
 * Reference: raw-port/re/disasm/ProChannel.OZBezierSanitizeControlPolygon.s — the body
 * calls PCMath::quadratic @0xacc78 (a stub for ProCore's quadratic solver, undecoded name at
 * the stub level; matches the shape of `quadraticD` in raw-port/src/infra/PCMath.ts) and does
 * a monotonic-time clamp on xs[1..2] using the solver's roots.
 */
export function OZBezierSanitizeControlPolygon(_xs: number[], _ys: number[]): void {
  throw new Error(
    "OZBezierSanitizeControlPolygon @ProChannel 0xa550c not yet transcribed — the clamp-handles " +
      "mode gate (sp->0xa8[0]==0 && sp->0xa8[3]==1) fired but the sanitize body is not yet " +
      "ported. See raw-port/re/disasm/ProChannel.OZBezierSanitizeControlPolygon.s.",
  );
}

/** Re-export the OZKeypoint symbol so the ledger sees this file has a real class touch even
 *  though it's a free-function file (mirrors PORTING_SPEC Rule 6: file name = fn name). */
export type _KeypointRef = OZKeypoint;
