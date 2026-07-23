# PAETint tint-COLOUR transfer (2026-07-23) — same intermediate-value gap as Colorize endpoints

Broadened Tint golden 4 -> 9 param cases (added cyan/magenta/yellow secondaries + intensity
0.25/0.75 sweeps). ALL verify at 0.89 lvl EXCEPT one: `warm_full` (tint colour 0.8/0.5/0.2),
which diverges 2.59 lvl (worst B channel: gray-128 input -> FCP B=68.6 vs engine 66.0).

Pattern matches PAEColorize exactly: tint colours whose channels are 0 or 1 (all built-in Tint
users + primaries/secondaries) are EXACT under the decoded HgcTint hard-light + tint^1.134 model,
but a tint colour with INTERMEDIATE channels (0.2, 0.5, 0.8) drifts ~2.6 lvl — the tint colour
needs the same endpoint-style transfer decoded for Colorize (sRGB->linear on the parameter colour),
which the current `^1.134` power approximates but doesn't nail for mid values. Gate-inert: every
shipping Tint host authors a primary/secondary or gray tint (0/1-channel), all VERIFIED (0.89 lvl,
243 samples incl. intensity sweeps). The fractional-tint-colour regime is unexercised; documented
as the same intermediate-parameter-colour transfer lead as Colorize (colorize_endpoint_sweep.json).
