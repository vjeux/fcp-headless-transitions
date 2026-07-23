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
