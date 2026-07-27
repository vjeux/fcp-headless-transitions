# Transform(100) channel param-ids — DECODED by census over all 65 shipped templates (2026-07-27)

Direct children of the Transform(100) parameter, with occurrence counts:
  Position     id 101   (811x)   — GROUP: X(1)/Y(2)/Z(3), pixels
  Scale        id 105   (560x)   — GROUP: X(1)/Y(2)/Z(3) or uniform, 1.0=100%.  ALWAYS 105 in Transform(100).
  Rotation     id 102   (413x)   — SCALAR: single leaf = in-plane Z angle (2D transform), degrees.
  Rotation     id 109   (326x)   — GROUP: X(1)/Y(2)/Z(3) Euler leaves (3D transform), degrees.
  Anchor Point id 107   (235x)   — GROUP: X(1)/Y(2)/Z(3), pixels.
  Shear        id 106   (2x)     — rare.

Rotation is the ONLY transform sub-param with two id/shape variants (102 scalar vs 109 group); a node
uses one or the other. Position/Scale/Anchor are stable ids. => readRotation() must accept both.

Scale ids 327/116 (parent Object(2) — plugin/generator params), 204 (parent 'behavior' — a rig End
Value), and the small ids under Snapshots(202) are NOT node transforms; they must NOT be read as the
Transform scale. Confirms Transform(100).Scale is exclusively id 105.

Axis leaves inside each group: X=1, Y=2, Z=3.
Channel-ref addressing (OZChannelRef path): "./1/100/<groupid>/<axis>", e.g. ./1/100/109/2 = Rotation.Y,
./1/100/102 = the scalar 2D rotation (no axis suffix), ./1/100/105/1 = Scale.X.
