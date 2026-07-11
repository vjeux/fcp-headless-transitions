# Polar-space blur shaders (PAERadialBlur spin + PAEZoomBlur) — verbatim

PAERadialBlur (spin) and PAEZoomBlur both blur in POLAR space:
  screen --RectToPolar--> polar image --1D Gaussian (HDirectionalBlur)--> --PolarToRect--> screen
Spin: Gaussian along the ANGLE axis. Zoom: Gaussian along the RADIUS axis.

Amount scaling (from -[PAERadialBlur/PAEZoomBlur canThrowRenderOutput:] disasm):
  Radial:  amount' = getFloat(Amount) * 1.5 ; HDirectionalBlur radius = amount' * d8
  Zoom:    amount' = getFloat(Amount) * 1.5 * 0.5 ; radius from inverse pixel transform
  (d8/d9 are pixel-transform scale factors.)
Radial adds HgcRadialMask + getMaxDistanceFromCenter normalization; Zoom adds HGCrop.

## HgcRectToPolar (screen -> polar) — verbatim
Constants: the c0/c1 poly is a fast atan2 approximation (minimax). Net:
  p = texCoord*P[4] - P[1] (+P[6])          // pixel pos relative to center
  angle = atan2(p.y, p.x)  (via the minimax poly, range-reduced; +2π wrap)  * P[0].x
  radius = sqrt(dot(p,p))
  polar.x = angle-derived coord, polar.y = radius       (then normalized by P[5],P[7])
  (P[0].x = angle->x scale; P[2].y, P[3].z select behavior; P[6]=center; P[7]=1/texSize)

## HgcPolarToRect (polar -> screen) — verbatim
  a = texCoord*P[3].xy + P[2].xy        // recover (angle, radius) with wrap handling
  x = radius*cos(angle*P[0].x); y = radius*sin(angle*P[0].x)  (+center P[1])
  (P[2]=half-size wrap consts; the fract/floor logic wraps angle across the 0/2π seam;
   P[4]=radius scale, P[6]=offset, P[6].zw=1/texSize for the final source sample)

## Implementation plan (TS)
1. Build polar image: for each (angleIdx, radiusIdx), sample screen at
   center + radius*(cos θ, sin θ). Polar dims: width=angleBins (2π/Δθ),
   height=maxRadius. upscaleFactor from the call (=1 in the shipped path).
2. 1-D Gaussian along angle (spin) / radius (zoom), sigma from amount'.
3. Inverse remap: for each screen pixel, compute (θ, r), bilinear-sample the
   blurred polar image.
4. Spin: normalize by max radius (HgcRadialMask). Zoom: crop.
