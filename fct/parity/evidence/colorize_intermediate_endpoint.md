# PAEColorize intermediate-endpoint regime (2026-07-23) — headless probe

The VERIFIED Colorize decode (WS mix, raw-sRGB endpoints, Rec.709-code luma) is exact for
endpoints whose channels are 0 or 1 (all built-in users). Probing INTERMEDIATE endpoints
confirms the documented undecoded gap (channel-mixer.ts colorizeRemapFilter header):

  darkgray->lightgray  (black=0.2 gray, white=0.85 gray), gray input, Intensity=1:
    in= 16: FCP=30.1  engine(WS-raw)=34   s2l_direct=19.0
    in=128: FCP=104.9 engine=112          s2l_direct=92.8
    in=240: FCP=168.6 engine=177          s2l_direct=166.6
  teal_orange / black_green_white_magenta (mid-range coloured endpoints): 6-11 lvl divergence.

Neither raw-sRGB nor s2l-linearised endpoints match FCP across the range: s2l is close at the
HIGH end (240->166.6 vs 168.6) but far at the LOW end (16->19 vs 30.1), while raw is uniformly
~6-9 high. So the endpoint transfer is NON-trivial (not identity, not sRGB EOTF) — consistent
with the ".motr Colorize::HDR In Rec.709" per-endpoint gamut op that is still undecoded. This
requires an endpoint-sweep probe (fix input, sweep one endpoint channel 0..1, read output) to
recover the transfer curve — a dedicated decode. All built-in Colorize users author 0/1 endpoints
(VERIFIED at 0.70 lvl), so this regime is unexercised; documented for a future endpoint-decode.

## UPDATE 2026-07-23g — ENDPOINT TRANSFER DECODED = sRGB->linear (s2l), EXACT
Endpoint-sweep probe (flat-white input luma=1 -> out = white-endpoint transfer; flat-black
input luma=0 -> out = black-endpoint transfer), sweeping one endpoint channel 0..1:
  endpoint 0.1->2.6  0.2->8.2  0.25->13.1  0.3->18.6  0.5->54.6  0.75->133.6  0.9->200.8  1.0->254.6
  == srgb_to_linear(v)*255 EXACTLY (max |err| 0.4 lvl) for BOTH the white AND black endpoints.
  (raw*255 is off by up to 73; ws-gamma off by 125.) So the "Colorize::HDR In Rec.709" endpoint
  op IS the standard sRGB EOTF (IEC 61966-2-1), and the output is emitted DIRECTLY to the linear
  framebuffer (no re-encode: re-encoding overshoots +47-58). This DECODES the previously-"undecoded"
  endpoint transfer. Evidence: colorize_endpoint_sweep.json.

## Remaining piece: the luma INTERPOLATION curve (gray-input sweep)
With s2l endpoints + DIRECT-linear output, the interpolation param t solved from FCP on a gray
sweep (darkgray 0.2 -> lightgray 0.85) is:
  Ycode: 0.063 0.125 0.251 0.502 0.784 0.941
  t    : 0.129 0.205 0.338 0.574 0.820 0.953
t is NOT linear in Ycode (err 0.087), NOR Yc^0.51117 WS (0.155), NOR s2l(Yc) (0.358). Best simple
fit t=Yc^0.85 (err 0.034) but not principled -> the interpolation uses a luma curve between code
and a mild power. Endpoints are DECODED (s2l); the interpolation curve is the last ~10-15 lvl piece
for intermediate endpoints. Since headless is the source of truth and s2l is exact on endpoints,
a full headless-faithful Colorize (s2l endpoints + this luma curve + direct-linear out) is within
reach once the curve is pinned (needs a gray-luma sweep at more points + a principled form). All
built-in users author 0/1 endpoints so the shipped RAW/WS path stays VERIFIED (0.70) meanwhile.

## UPDATE 2026-07-23h — luma remap is IDENTITY for 0/1 endpoints; intermediate-endpoint interp unresolved
Pure luma remap (black=0, white=1), dense gray sweep 0..255: output == input EXACTLY (max 0.3 lvl)
— confirms luma=Rec.709-on-codes and the 0/1 path is exact identity (why all built-in users verify).
For INTERMEDIATE endpoints (darkgray 0.2 -> lightgray 0.85) the mid-luma interpolation matches
NONE of: direct-linear s2l-interp (-14.7), raw-code interp (+30-38), linear-luma interp (-60). FCP
sits BETWEEN direct-linear and raw — a partial encode not yet pinned. Endpoints DECODED (s2l, exact);
this interpolation curve for non-0/1 endpoints needs a dense luma sweep at a FIXED intermediate
endpoint pair to isolate its shape (separate targeted probe). Gate-inert (built-ins use 0/1).
Evidence: colorize_luma_sweep.json (0/1 identity), colorize_endpoint_sweep.json (s2l endpoints).
