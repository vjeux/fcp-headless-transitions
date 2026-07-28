// TrackballGeneration.ts — Ozone TrackballGeneration: geometry generator for
// the "velocity view" trackball overlay in FCP's stereoscopic / 3D-space
// disparity UI. Builds a line-list of OZVelocityViewTrackballVertex entries
// (position xyz + rgba color, 0x20 = 32 bytes each) representing the wireframe
// latitude & longitude rings of a small "trackball" sphere.
//
// This TS file transcribes:
//
//   @0x3fba20  TrackballGeneration::buildLatitudeRing(
//                V3f center, float radius, int n,
//                std::vector<OZVelocityViewTrackballVertex>&)
//                                                     — FULLY PORTED.
//                                                     Emits a closed line-list
//                                                     ring (2*n vertices, n
//                                                     segments) in the XZ
//                                                     plane at Y=center.y,
//                                                     radius `radius`, using
//                                                     the double-precision
//                                                     ___sincos_stret for
//                                                     per-vertex angle. All
//                                                     vertices colored white
//                                                     (1,1,1,1).
//
//   @0x3fbf50  TrackballGeneration::buildLongitudeRing(
//                V3f center, float radius, int n,
//                float ringAngle,
//                std::vector<OZVelocityViewTrackballVertex>&)
//                                                     — FULLY PORTED.
//                                                     Emits a closed line-list
//                                                     ring rotated around the
//                                                     Y axis by `ringAngle`
//                                                     (via a unit quaternion
//                                                     q = (cos(θ/2), 0,
//                                                     sin(θ/2), 0) applied
//                                                     using the standard
//                                                     Rodrigues formula
//                                                       v' = v + 2·qs·(qv×v)
//                                                          + 2·qv×(qv×v)
//                                                     mirroring the exact
//                                                     shufps 0xd2 / 0xc9
//                                                     lane-permutation cross
//                                                     product recipe emitted
//                                                     by the compiler). The
//                                                     un-rotated points lie in
//                                                     the XY plane
//                                                     (center + radius·(cos,
//                                                     sin, 0)); after Y-axis
//                                                     rotation, the ring
//                                                     hangs vertically around
//                                                     the sphere at longitude
//                                                     `ringAngle`. Uses the
//                                                     scalar-float
//                                                     ___sincosf_stret for
//                                                     the θ/2 quaternion set-
//                                                     up and the double
//                                                     ___sincos_stret for
//                                                     per-vertex angles. All
//                                                     vertices colored white
//                                                     (1,1,1,1).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice).
// Disasm saved: raw-port/re/disasm/TrackballGeneration.buildLatitudeRing.s
//               raw-port/re/disasm/TrackballGeneration.buildLongitudeRing.s
//
// Data-constant provenance (RIP-relative reads, all in __TEXT.__const):
//   @0x707750  double 6.283185307179586  = 2π  (angle-step denominator,
//                                              buildLatitudeRing @0x3fba61,
//                                              buildLongitudeRing @0x3fbf96)
//   @0x706df0  float4 (1.0, 1.0, 1.0, 1.0)     = the vertex-color constant
//                                                  written at *(vertex+0x10)
//                                                  every push. Cited from
//                                                  every color-write site.
//   @0x70bae0  float4 (0.0, 1.0, 0.0, 0.0)     = the fixed rotation axis
//                                                  broadcast-multiplied into
//                                                  sin(θ/2) to yield the
//                                                  quaternion vector part qv
//                                                  (i.e. rotation is around
//                                                  the Y axis, always).
//   @0x706f54  float  0.5                       = the θ/2 pre-multiplier for
//                                                  the quaternion setup.
//
// libc++ std::vector choreography: FCP inlines the full push_back /
// __split_buffer / __allocate / __throw_length_error state machine for
// vector<OZVelocityViewTrackballVertex>. Because the vertex struct is fully
// decoded (32 bytes = V4f position + V4f color, from the two consecutive
// movaps @+0x0 and @+0x10 at every emission site), we can bypass the libc++
// ABI and just push_back onto a plain JS array — the observable output
// (final vertex sequence) is identical to what the asm produces. The three
// throw paths (__throw_length_error @0x3fbf43, __throw_bad_array_new_length
// @0x3fbf48, same addrs for buildLongitudeRing at @0x3fc534 / @0x3fc539)
// are cited but unreachable at TS array sizes.
//
// Vertex struct — OZVelocityViewTrackballVertex — DECODED from the emission
// sites (movaps 16 bytes at *v, movaps 16 bytes at *(v+0x10), addq $0x20):
//
//    offset  size  field       provenance
//    ------  ----  ----------  ------------------------------------------
//    0x00    16    position    V4f (x,y,z,w). Written by every `movaps
//                              xmm3, (%r15)` at latitude offsets
//                              @0x3fbaa4/@0x3fbae4/@0x3fbb36/@0x3fbbca/…
//                              and longitude @0x3fc077/@0x3fc0b7/…/@0x3fc41e.
//    0x10    16    color       V4f (r,g,b,a). Written by every `movaps
//                              (1,1,1,1)@0x706df0, 0x10(%r15)` at the same
//                              set of emission sites.
//    (total = 0x20 bytes; matches the per-element stride `addq $0x20,%r15`.)

/**
 * V4f — a 4-lane single-precision float vector. All lanes are Math.fround-
 * narrowed to enforce the f32 SSE semantics of the source (movaps/mulps/
 * addss all operate on IEEE-754 binary32).
 */
export type V4f = readonly [number, number, number, number];

/** OZVelocityViewTrackballVertex — 32-byte trackball wireframe vertex. */
export interface OZVelocityViewTrackballVertex {
  /** V4f position at @+0x00. */
  readonly position: V4f;
  /** V4f color at @+0x10. */
  readonly color: V4f;
}

/** The (1,1,1,1) f32 color constant at @Ozone 0x706df0 (RIP-const shared by
 *  every color-emission site). Materialized once so the doc-comment addr can
 *  be cited on every push. */
const COLOR_WHITE_0x706df0: V4f = [
  Math.fround(1.0),
  Math.fround(1.0),
  Math.fround(1.0),
  Math.fround(1.0),
];

/** 2π (double) at @Ozone 0x707750 — used as the numerator of the per-vertex
 *  angle step 2π/n in both buildLatitudeRing (movsd @0x3fba61 / divsd
 *  @0x3fba69) and buildLongitudeRing (movsd @0x3fbf96 / divsd @0x3fbf9e). */
const TWO_PI_0x707750 = 6.283185307179586;

/** 0.5 (single float) at @Ozone 0x706f54 — the θ/2 pre-multiplier that
 *  buildLongitudeRing applies to `ringAngle` before ___sincosf_stret to
 *  obtain the quaternion half-angle (@0x3fbf75 mulss). */
const HALF_0x706f54 = Math.fround(0.5);

/**
 * TrackballGeneration — a stateless algorithmic object; both decoded methods
 * are effectively static (no `this` accesses in the asm, no instance-field
 * loads). The C++ class exists purely as a namespace for the two ring
 * builders. Methods are provided as instance methods to mirror the C++
 * signature; a shared no-argument constructor is left implicit.
 */
export class TrackballGeneration {
  /**
   * @@0x3fba20  TrackballGeneration::buildLatitudeRing(V3f center, float
   *             radius, int n, std::vector<OZVelocityViewTrackballVertex>&)
   *
   * Emits `2*n` vertices as a line list (n segments) tracing a horizontal
   * ring in the XZ plane at Y=center.y with the given `radius`. Vertex[i]
   * position is (center.x + radius·cos(i·2π/n), center.y,
   *              center.z + radius·sin(i·2π/n), center.w).
   *
   * Faithful mirror of the asm loop structure:
   *
   *   if (n <= 0) return;                                       ; @0x3fba42
   *   float delta   = (float)(2π / (double)n);                  ; @0x3fba61-@0x3fba70
   *   float angle   = delta;                                    ; @0x3fba8c
   *   V4f   start   = center;
   *   start.x       += radius;                                  ; @0x3fba7f (addss lane0)
   *   V4f   prev    = start;                                    ; @0x3fba95
   *   int   left    = n;                                        ; @0x3fba4d
   *   while (true) {                                            ; @0x3fbac5 loop head
   *     if (left == 1) {                                        ; @0x3fbac5-@0x3fbad1
   *       push_back({prev, WHITE});                             ; @0x3fbae4/@0x3fbaa4
   *       push_back({start, WHITE});                            ; @0x3fbaa0/@0x3fbc9c
   *       return;                                               ; @0x3fbabf (decl→0→je)
   *     }
   *     double s,c; ___sincos_stret((double)angle, &s, &c);     ; @0x3fbb19
   *     push_back({prev, WHITE});                               ; @0x3fbb36/@0x3fbd84
   *     V4f newpos = center;
   *     newpos.x  = (float)c * radius + center.x;               ; @0x3fbde4-@0x3fbe04
   *     newpos.z  = (float)s * radius + center.z;               ; @0x3fbdf9-@0x3fbe0c
   *     // blendps 0xe @0x3fbe14 → (newpos.x, cy, cz, cw)
   *     // insertps 0x20 @0x3fbe1a → lane2 = sin·r + center.z
   *     push_back({newpos, WHITE});                             ; @0x3fbe2d/@0x3fbebf
   *     prev = newpos;                                          ; @0x3fbf15 restores xmm3
   *     angle += delta;                                         ; @0x3fbf1d-@0x3fbf27
   *     if (--left == 0) return;                                ; @0x3fbabc/@0x3fbabf
   *   }
   *
   * White-color source: `movaps 0x30b341(%rip), %xmm0` @0x3fbaa8 resolves to
   * @0x706df0 = (1.0, 1.0, 1.0, 1.0). Every other movaps of the same VA
   * (@0x3fbae9, @0x3fbb3b, @0x3fbbcf, @0x3fbca5, @0x3fbd89, @0x3fbe31,
   * @0x3fbec4) is the identical (1,1,1,1) f32 constant.
   *
   * Un-ported callees (throw-stubbed — none reachable from correct JS usage):
   *   __Znwm                       @stub 0x6dfca2  (operator new(size_t))
   *   _memcpy                      @stub 0x6dff8a
   *   __ZdlPv                      @stub 0x6dfc36  (operator delete(void*))
   *   ___sincos_stret              @stub 0x6dfd2c  — modeled via Math.sin/cos
   *   std::vector<...>::__throw_length_error   @0x3fbf43 (unreachable)
   *   std::__throw_bad_array_new_length         @0x3fbf48 (unreachable)
   */
  buildLatitudeRing(
    center: V4f,
    radius: number,
    n: number,
    out: OZVelocityViewTrackballVertex[],
  ): void {
    // @0x3fba42  testl %edi,%edi ; jle .return
    if (n <= 0) return;

    // @0x3fba61-@0x3fba70:
    //   cvtsi2sd %edi, %xmm0        ; xmm0(d) = (double)n
    //   movsd    2π@0x707750, %xmm1
    //   divsd    %xmm0, %xmm1       ; xmm1(d) = 2π / n
    //   cvtsd2ss %xmm1, %xmm0       ; xmm0(f) = (float)(2π / n)
    const delta = Math.fround(TWO_PI_0x707750 / n);

    // @0x3fba50-@0x3fba7f:
    //   xmm2 = center; xmm2.lane0 += radius   ; addss @0x3fba7f
    //   => "start" = (center.x + radius, center.y, center.z, center.w)
    const radiusF = Math.fround(radius);
    const cx = Math.fround(center[0]);
    const cy = Math.fround(center[1]);
    const cz = Math.fround(center[2]);
    const cw = Math.fround(center[3]);
    const startX = Math.fround(cx + radiusF);
    const start: V4f = [startX, cy, cz, cw];

    // @0x3fba8c: -0x3c(%rbp) = delta      ; the "current angle" state slot,
    //                                     ; initialized to delta (first sincos
    //                                     ; is at t=delta — vertex #0 emitted
    //                                     ; separately as `start`).
    let angle = delta;

    // @0x3fba95: xmm3 = xmm2 = start      ; "prev" position, updated at the
    //                                     ; end of each non-last iteration.
    let prev: V4f = start;

    // @0x3fba4d: r14d = n                 ; loop counter.
    let left = n;

    // @0x3fbac5 loop head.
    while (true) {
      if (left === 1) {
        // @0x3fbad3/@0x3fbaa0 last-iter fast path: emit two vertices
        // (prev, start), closing the ring back to its starting point.
        out.push({ position: prev, color: COLOR_WHITE_0x706df0 });   // @0x3fbae4 + @0x3fbaa4
        out.push({ position: start, color: COLOR_WHITE_0x706df0 });  // @0x3fbaa0
        // @0x3fbabc: decl r14d ; @0x3fbabf: je .return
        return;
      }

      // @0x3fbb10-@0x3fbb19: sincos((double)angle) → (sinD, cosD).
      // Modeled via Math.sin/Math.cos (both IEEE-754 f64, matching the
      // ___sincos_stret contract; the cvtsd2ss narrow-to-f32 is applied
      // at the mulss/addss sites below via Math.fround).
      const angleD = angle; // implicit cvtss2sd @0x3fbb15
      const sinD = Math.sin(angleD);
      const cosD = Math.cos(angleD);

      // @0x3fbb36/@0x3fbd84 push_back({prev, WHITE}).
      out.push({ position: prev, color: COLOR_WHITE_0x706df0 });

      // @0x3fbde4-@0x3fbe1a: compute newpos.
      //   xmm3 = (float)cosD           ; cvtsd2ss  @0x3fbde7
      //   xmm3 *= radius               ; mulss     @0x3fbdf2
      //   xmm3 += center.x             ; addss     @0x3fbe04
      //   xmm0 = (float)sinD           ; cvtsd2ss  @0x3fbdf9
      //   xmm0 *= radius               ; mulss     @0x3fbe08
      //   xmm0 += center.z             ; addss -0xb0 (=center.z) @0x3fbe0c
      //   blendps $0xe → lanes(1,2,3) from center = (newx, cy, cz, cw)
      //   insertps $0x20 → lane2 = xmm0 = sin·r + cz
      //  ⇒ newpos = (cosD·radius + cx, cy, sinD·radius + cz, cw)
      const cosF = Math.fround(cosD);
      const sinF = Math.fround(sinD);
      const newX = Math.fround(Math.fround(cosF * radiusF) + cx);
      const newZ = Math.fround(Math.fround(sinF * radiusF) + cz);
      const newpos: V4f = [newX, cy, newZ, cw];

      // @0x3fbe2d/@0x3fbebf push_back({newpos, WHITE}).
      out.push({ position: newpos, color: COLOR_WHITE_0x706df0 });

      // @0x3fbf15 restore xmm3 = newpos (via -0x50 stash); @0x3fbf1d-@0x3fbf27
      // angle += delta.
      prev = newpos;
      angle = Math.fround(angle + delta);

      // @0x3fbabc: decl r14d ; @0x3fbabf: je .return
      left--;
      if (left === 0) return;
    }
  }

  /**
   * @@0x3fbf50  TrackballGeneration::buildLongitudeRing(V3f center, float
   *             radius, int n, float ringAngle,
   *             std::vector<OZVelocityViewTrackballVertex>&)
   *
   * Emits `max(1, 2*n)` vertices as a line list — a full ring in the XY
   * plane rotated around the Y axis by `ringAngle`. The rotation is applied
   * as a unit quaternion q = (cos(θ/2), 0, sin(θ/2), 0) using the classic
   * Rodrigues formula
   *
   *      v' = v + 2·qs·(qv × v) + 2·qv × (qv × v)
   *
   * The compiler emits this cross product using SSE shufps 0xd2 (lane
   * permutation (2,0,1,3)) and 0xc9 (permutation (1,2,0,3)) — the standard
   * two-permutation SIMD cross product. We transcribe the *general* Rodrigues
   * form to match the asm bit-for-bit (the compiler didn't strength-reduce
   * for the fact that qv = (0, sinH, 0, 0) has only one nonzero lane).
   *
   * Faithful mirror of the asm structure:
   *
   *   float half = ringAngle * 0.5f;                   ; @0x3fbf75 (mulss @0x706f54)
   *   float sinH, cosH; ___sincosf_stret(half, ...);   ; @0x3fbf80
   *   if (n <= 0) return;                              ; @0x3fbf85 testl / jle
   *   float delta   = (float)(2π / (double)n);         ; @0x3fbf96-@0x3fbfa2
   *   V4f   qv      = (0, sinH, 0, 0);                 ; @0x3fbfac-@0x3fbfb0
   *                                                    ;  (broadcast sinH; ·(0,1,0,0)
   *                                                    ;   @0x70bae0)
   *   V4f   startXY = center; startXY.x += radius;     ; @0x3fbfc3 (addss xmm8@lane0)
   *   V4f   start   = rodrigues(startXY, qv, cosH);    ; @0x3fbfc8-@0x3fc01f
   *   int   nVerts  = max(1, 2*n);                     ; @0x3fc022-@0x3fc03e
   *   int   closeIdx = 2*n - 1;                        ; @0x3fc028-@0x3fc030
   *   float angle   = delta;                           ; @0x3fc055
   *   V4f   prev    = start;                           ; @0x3fc05a (-0xa0)
   *   int   i       = 0;                               ; @0x3fc04d
   *   while (i < nVerts) {                             ; @0x3fc09c loop head
   *     if (i == closeIdx) {                           ; @0x3fc09c cmpl -0x54
   *       push_back({prev, WHITE});                    ; @0x3fc0b7 (single vert)
   *       if (++i == nVerts) return;                   ; @0x3fc08f
   *       continue;
   *     }
   *     double s,c; ___sincos_stret((double)angle,...);; @0x3fc0e9
   *     push_back({prev, WHITE});                      ; @0x3fc106
   *     V4f   pXY = (center.x + (float)c·radius,
   *                  center.y + (float)s·radius,
   *                  center.z, center.w);              ; @0x3fc3a7-@0x3fc3bf
   *     V4f   pRot = rodrigues(pXY, qv, cosH);         ; @0x3fc3c5-@0x3fc40e
   *     push_back({pRot, WHITE});                      ; @0x3fc41e
   *     prev = pRot;                                   ; @0x3fc4fe restore xmm7
   *     angle += delta;                                ; @0x3fc506-@0x3fc510
   *     ++i;                                           ; @0x3fc515
   *   }
   *
   * Un-ported callees (throw-stubbed — none reachable from correct JS usage):
   *   ___sincosf_stret             @stub 0x6dfd32  — modeled via Math.sin/cos
   *   ___sincos_stret              @stub 0x6dfd2c
   *   __Znwm                       @stub 0x6dfca2
   *   _memcpy                      @stub 0x6dff8a
   *   __ZdlPv                      @stub 0x6dfc36
   *   std::vector<...>::__throw_length_error   @0x3fc534 (unreachable)
   *   std::__throw_bad_array_new_length         @0x3fc539 (unreachable)
   */
  buildLongitudeRing(
    center: V4f,
    radius: number,
    n: number,
    ringAngle: number,
    out: OZVelocityViewTrackballVertex[],
  ): void {
    // @0x3fbf75: xmm2 (= ringAngle) *= 0.5f @0x706f54.
    // @0x3fbf80: ___sincosf_stret(half) → (sinH, cosH) packed in xmm0.
    const half = Math.fround(Math.fround(ringAngle) * HALF_0x706f54);
    const sinH = Math.fround(Math.sin(half));
    const cosH = Math.fround(Math.cos(half));

    // @0x3fbf85: testl r14d,r14d ; jle .return
    if (n <= 0) return;

    // @0x3fbf96-@0x3fbfa2:
    //   cvtsi2sd %r14d, %xmm2        ; xmm2 = (double)n
    //   movsd    2π, %xmm1
    //   divsd    %xmm2, %xmm1        ; xmm1 = 2π / n  (as double)
    //   cvtsd2ss %xmm1, %xmm4        ; xmm4 = (float)(2π / n)
    const delta = Math.fround(TWO_PI_0x707750 / n);

    // @0x3fbfac-@0x3fbfb0:
    //   shufps $0x0 → xmm5 = (sinH, sinH, sinH, sinH)
    //   mulps  (0,1,0,0)@0x70bae0 → xmm5 = (0, sinH, 0, 0) = qv
    const qv0 = Math.fround(0.0);
    const qv1 = sinH;
    const qv2 = Math.fround(0.0);
    const qv3 = Math.fround(0.0);

    // @0x3fbfb7-@0x3fbfc3:
    //   xmm0 = center
    //   xmm0.lane0 += radius (arg2 = xmm8 saved at -0x40)
    //   ⇒ startXY = (center.x + radius, center.y, center.z, center.w)
    const radiusF = Math.fround(radius);
    const cx = Math.fround(center[0]);
    const cy = Math.fround(center[1]);
    const cz = Math.fround(center[2]);
    const cw = Math.fround(center[3]);
    const startXY: V4f = [Math.fround(cx + radiusF), cy, cz, cw];

    // @0x3fbfc8-@0x3fc01f: apply Rodrigues rotation to startXY.
    const start = rotateY_Rodrigues(startXY, qv0, qv1, qv2, qv3, cosH);

    // @0x3fc022-@0x3fc03e:
    //   eax = 2*n
    //   ecx = 2*n - 1                             ; -0x54 (close index)
    //   ecx = (2n >= 2) ? 2n : 1                  ; cmovgel via cmpl $0x2
    //   -0x50 = loop count (= max(1, 2n))
    const nVerts = 2 * n >= 2 ? 2 * n : 1;
    const closeIdx = 2 * n - 1;

    // @0x3fc050-@0x3fc055: -0x30 = -0x4c = delta  ; angle state slots.
    let angle = delta;

    // @0x3fc05a: -0xa0 = xmm7 = start             ; "prev" position.
    let prev: V4f = start;

    // @0x3fc04d: xorl r12d,r12d                    ; loop index i = 0.
    let i = 0;

    // @0x3fc09c loop head.
    while (i < nVerts) {
      if (i === closeIdx) {
        // @0x3fc0aa-@0x3fc0d9 fast/grow paths: emit a single closing vertex.
        // No sincos, no new-position computation.
        out.push({ position: prev, color: COLOR_WHITE_0x706df0 });   // @0x3fc077 / @0x3fc0b7
        // @0x3fc08f: incl r12d ; @0x3fc092: cmpl r12d, -0x50 ; je .return
        i++;
        if (i === nVerts) return;
        continue;
      }

      // @0x3fc0e0-@0x3fc0e9: ___sincos_stret((double)angle) → (s, c).
      const angleD = angle; // cvtss2sd @0x3fc0e5
      const sinD = Math.sin(angleD);
      const cosD = Math.cos(angleD);

      // @0x3fc102-@0x3fc116 (or grow @0x3fc342): push_back({prev, WHITE}).
      out.push({ position: prev, color: COLOR_WHITE_0x706df0 });

      // @0x3fc3a7-@0x3fc3bf: compute un-rotated pXY.
      //   movlhps xmm2, xmm1 → xmm1 = (cosD, sinD) as 2 doubles
      //   cvtpd2ps           → xmm0 = (cosF, sinF, 0, 0)
      //   mulps  -0xc0(=movsldup(arg2)=(radius, radius, 0, 0)) → (cosF·r, sinF·r, 0, 0)
      //   addps  -0xb0(=center)                                → (cosF·r+cx, sinF·r+cy, cz, cw)
      //   blendps $0xc, center → keep lanes 2,3 from center     ; @0x3fc3bf
      //   ⇒ pXY = (cosF·r + cx, sinF·r + cy, cz, cw)
      const cosF = Math.fround(cosD);
      const sinF = Math.fround(sinD);
      const pXY: V4f = [
        Math.fround(Math.fround(cosF * radiusF) + cx),
        Math.fround(Math.fround(sinF * radiusF) + cy),
        cz,
        cw,
      ];

      // @0x3fc3c5-@0x3fc40e: apply the same Rodrigues rotation to pXY.
      const pRot = rotateY_Rodrigues(pXY, qv0, qv1, qv2, qv3, cosH);

      // @0x3fc41e / @0x3fc4aa: push_back({pRot, WHITE}).
      out.push({ position: pRot, color: COLOR_WHITE_0x706df0 });

      // @0x3fc4fe: xmm7 = pRot (restored from -0x40); prev = pRot.
      prev = pRot;
      // @0x3fc506-@0x3fc510: angle += delta (stored at -0x30).
      angle = Math.fround(angle + delta);
      // @0x3fc515: incl r12d.
      i++;
    }
  }
}

/**
 * rotateY_Rodrigues — apply the quaternion rotation v' = v + 2·qs·(qv×v) +
 * 2·qv × (qv×v), transcribed to mirror the exact shufps-0xd2 / shufps-0xc9
 * two-permutation SIMD cross-product recipe emitted by the FCP compiler at
 * @Ozone 0x3fbfc8-@0x3fc01f (initial startXY rotation) and
 * @0x3fc3c5-@0x3fc40e (per-vertex pXY rotation).
 *
 * The general 4-lane cross product implemented in-register by the asm uses
 * two lane-permutations of both operands:
 *   perm(a, 0xd2) = (a.z, a.x, a.y, a.w)
 *   perm(a, 0xc9) = (a.y, a.z, a.x, a.w)
 *   perm(b, 0xd2) = (b.z, b.x, b.y, b.w)
 *   step        = b·perm_d2(a) − perm_d2(b)·a          ; lane-wise
 *   cross(a,b)  = perm_d2(step)                         ; = (ay·bz − az·by,
 *                                                          az·bx − ax·bz,
 *                                                          ax·by − ay·bx, aw·bw)
 *
 * All f32 lanes narrowed via Math.fround (matching mulps/subps/addps on f32).
 */
function rotateY_Rodrigues(
  v: V4f,
  qv0: number,
  qv1: number,
  qv2: number,
  qv3: number,
  qs: number,
): V4f {
  const vx = Math.fround(v[0]);
  const vy = Math.fround(v[1]);
  const vz = Math.fround(v[2]);
  const vw = Math.fround(v[3]);

  // 2·(qv × v) via the two-permutation trick.
  // @0x3fbfcb-@0x3fbfe2 (setup) / @0x3fc3c5-@0x3fc3e6 (per-vertex):
  //   xmm6 = perm(qv, 0xd2)                  ; (qv.z, qv.x, qv.y, qv.w)
  //   xmm1 = v * xmm6                        ; per-lane mul
  //   xmm2 = perm(v, 0xd2)                   ; (v.z, v.x, v.y, v.w)
  //   xmm2 = xmm2 * qv
  //   xmm1 = xmm1 - xmm2
  //   xmm1 = xmm1 + xmm1                     ; = 2·(qv × v) permuted
  const qvPerm0 = qv2; // perm(qv, 0xd2) lane 0 = qv.z
  const qvPerm1 = qv0; // lane 1 = qv.x
  const qvPerm2 = qv1; // lane 2 = qv.y
  const qvPerm3 = qv3; // lane 3 = qv.w

  const vPerm0 = vz; // perm(v, 0xd2) lane 0 = v.z
  const vPerm1 = vx; // lane 1 = v.x
  const vPerm2 = vy; // lane 2 = v.y
  const vPerm3 = vw; // lane 3 = v.w

  const step0 = Math.fround(Math.fround(vx * qvPerm0) - Math.fround(vPerm0 * qv0));
  const step1 = Math.fround(Math.fround(vy * qvPerm1) - Math.fround(vPerm1 * qv1));
  const step2 = Math.fround(Math.fround(vz * qvPerm2) - Math.fround(vPerm2 * qv2));
  const step3 = Math.fround(Math.fround(vw * qvPerm3) - Math.fround(vPerm3 * qv3));

  const twoCrossPerm0 = Math.fround(step0 + step0);
  const twoCrossPerm1 = Math.fround(step1 + step1);
  const twoCrossPerm2 = Math.fround(step2 + step2);
  const twoCrossPerm3 = Math.fround(step3 + step3);

  // @0x3fbfe5-@0x3fbfe8 / @0x3fc3e9-@0x3fc3ec:
  //   xmm7 = perm(xmm1, 0xd2)               ; permuted-of-permuted = 2·(qv × v)
  const twoCross0 = twoCrossPerm2; // perm(x, 0xd2) lane 0 = lane 2 of x
  const twoCross1 = twoCrossPerm0; // lane 1 = lane 0
  const twoCross2 = twoCrossPerm1; // lane 2 = lane 1
  const twoCross3 = twoCrossPerm3; // lane 3 = lane 3

  // @0x3fbfec-@0x3fbffd / @0x3fc3f0-@0x3fc3fa:
  //   xmm3 = broadcast qs (cos(θ/2)) to all 4 lanes    ; shufps $0x55, xmm3
  //   xmm2 = xmm3 * xmm7 + v                           ; = v + 2·qs·(qv×v)
  const qsF = Math.fround(qs);
  const partialA0 = Math.fround(Math.fround(qsF * twoCross0) + vx);
  const partialA1 = Math.fround(Math.fround(qsF * twoCross1) + vy);
  const partialA2 = Math.fround(Math.fround(qsF * twoCross2) + vz);
  const partialA3 = Math.fround(Math.fround(qsF * twoCross3) + vw);

  // @0x3fc000-@0x3fc01b / @0x3fc3fd-@0x3fc40a:
  //   xmm7 (= twoCrossPerm) *= perm(qv, 0xd2) (= qvPerm)
  //   xmm1  = perm(twoCrossPerm, 0xc9) * qv
  //   xmm7 -= xmm1
  //   xmm7  = perm(xmm7, 0xd2)                          ; un-permuted 2·qv×(qv×v)
  const mulA0 = Math.fround(twoCrossPerm0 * qvPerm0);
  const mulA1 = Math.fround(twoCrossPerm1 * qvPerm1);
  const mulA2 = Math.fround(twoCrossPerm2 * qvPerm2);
  const mulA3 = Math.fround(twoCrossPerm3 * qvPerm3);

  // perm(twoCrossPerm, 0xc9) → (lane 1, lane 2, lane 0, lane 3)
  const tcpPermC90 = twoCrossPerm1;
  const tcpPermC91 = twoCrossPerm2;
  const tcpPermC92 = twoCrossPerm0;
  const tcpPermC93 = twoCrossPerm3;

  const mulB0 = Math.fround(tcpPermC90 * qv0);
  const mulB1 = Math.fround(tcpPermC91 * qv1);
  const mulB2 = Math.fround(tcpPermC92 * qv2);
  const mulB3 = Math.fround(tcpPermC93 * qv3);

  const diff0 = Math.fround(mulA0 - mulB0);
  const diff1 = Math.fround(mulA1 - mulB1);
  const diff2 = Math.fround(mulA2 - mulB2);
  const diff3 = Math.fround(mulA3 - mulB3);

  // perm(diff, 0xd2) → (lane 2, lane 0, lane 1, lane 3) = 2·qv×(qv×v)
  const twoQvCross0 = diff2;
  const twoQvCross1 = diff0;
  const twoQvCross2 = diff1;
  const twoQvCross3 = diff3;

  // @0x3fc01f / @0x3fc40e: xmm7 += xmm2  ; final = partialA + 2·qv×(qv×v)
  return [
    Math.fround(twoQvCross0 + partialA0),
    Math.fround(twoQvCross1 + partialA1),
    Math.fround(twoQvCross2 + partialA2),
    Math.fround(twoQvCross3 + partialA3),
  ];
}
