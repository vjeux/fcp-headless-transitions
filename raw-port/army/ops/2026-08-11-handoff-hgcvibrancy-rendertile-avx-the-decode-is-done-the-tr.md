# handoff: HgcVibrancy::RenderTile_AVX — the decode is done, the transcription is not

- **reported** 2026-08-11T22:24:00Z by worker-8
- **status** OPEN (unit requeued with `depclaim.py drop`; everything below is measured on this box
  today and is meant to be the next claimant's starting point, not their reading list)

## Why this file exists

`depclaim.py next` handed me `__ZN11HgcVibrancy14RenderTile_AVXEP6HGTile` @Flexo 0x146ed70 — 226
instructions, a 2-texel YMM main loop plus a 1-texel XMM tail, over tile rows. I decoded it,
established that it IS oracle-able here, and then ran out of the budget a faithful 226-instruction
transcription plus its differential needs. Handing back a HALF-oracled AVX kernel is the one outcome
this project should not want: the static gates pass on it (G5 sees a big real body), and the only
thing that could catch a mis-decoded operand order is the differential I would not have finished.

So the unit is requeued and the decode is here. The next claimant should not have to re-derive any
of it. Precedent for the shape of this file: the `handoff the last BT2100 AVX stub` entry.

## What is already settled

**The unit is oracle-able, and the harness to do it already exists.** `probe_avx.py` PASSes on this
box right now, so VEX.256 executes under Rosetta at the x86_64 addresses the port cites. The symbol
is LOCAL (`t`), so it is called by address via `ozone_loader.local_fn`. **The
`HgcBT2100_PQ_OOTF_qtApprox` pair is a drop-in template** — same `HGTile*` signature, same
`this+0x198` parameter bank, same wire format:

    raw-port/re/oracle/HgcBT2100_PQ_OOTF_qtApprox_RenderTile_AVX_oracle.py   (393 lines)
    raw-port/re/oracle/HgcBT2100_PQ_OOTF_qtApprox_RenderTile_AVX_driver.ts   ( 82 lines)

Only `SYM`/`ADDR`/`BODY`, the `SLOTS` list (below), the bank presets and the driver's import need to
change. `BODY` for this kernel is `8b 46 0c 2b 46 04 0f 8e` — the height test runs BEFORE the frame
is built, exactly as in the template, so there is no `pushq %rbp` to key on.

**One thing the template does NOT cover, and it decides the verdict: this kernel contains
`vrsqrtps` @0x146ef47 and `vrcpps` @0x146ef64.** Those are hardware ESTIMATES; OPS_LOG's measured
entry ("what `vrcpps` actually returns on this machine") gives the numbers — biased low, ~2.44e-04
relative, not exact even for powers of two — and the standing ruling is to model them as IEEE and
then ISOLATE them: build one corpus class in which the estimate cannot reach the output and require
THAT class to be bit-exact. Here that class is easy and it is worth setting up before writing a line
of TS: **set bank slot +0x160 to 0.0.** The estimate's only path to the output is

    m      = cb^2 + cr^2                                   @0x146ef33..0x146ef42
    e      = rsqrtps(m)                                    @0x146ef47
    e      = rcpps(B[0x140] * e) * B[0x140]                @0x146ef5f..0x146ef69   (~sqrt(m))
    e      = e * B[0x160]                                  @0x146ef6e
    e      = clamp_lane0(e, B[0x104], B[0xa0][0]) ; e = e*e @0x146ef77..0x146ef8b
    mask   = maxps(e, mask)                                @0x146ef8f

so with `B[0x160] = 0` the term is 0 (keep the inputs finite) and `maxps` returns the skin mask
unchanged. Everything except the estimate is then exactly specified and must be 0 divergences.

## The decode, in the form a transcription needs

**HGTile layout is the same as the landed siblings** (`Gettype1_half_unpremultTile_AVX`,
`HgcBT2100_PQ_OOTF_qtApprox`): +0x00 x0, +0x04 y0, +0x08 x1, +0x0c y1, +0x10 out, +0x18 out row
stride in TEXELS, +0x50 in, +0x58 in row stride in TEXELS (`movslq` then `shlq $4`, 16 bytes = one
RGBA f32 texel).

**Loop structure, and the counter is worth reading twice.** `w = x1-x0`, `h = y1-y0`; `h <= 0`
returns 0 without touching the destination (@0x146ed76 jumps straight to the `vzeroupper; xorl
%eax,%eax; retq` at 0x146f1d0 — the frame is never even built). Rows advance by the two strides
@0x146edb0. Per row:

* `w < 2` skips the vector loop entirely (@0x146edcb);
* otherwise the YMM loop is a DO-WHILE entered at 0x146ede0 with `rbx = 0x10`, loading
  `-0x10(%r9,%rbx)` (so the first load is at +0), advancing `rbx += 0x20` = 2 texels;
* the continue test is `(r11_old + w - 2) > 1` with `r11` running 0, -2, -4, … (@0x146efee..0x146f000),
  then `negl %r11d` — net effect **floor(w/2) iterations**, and `r11` afterwards is the number of
  texels done;
* the tail (@0x146f009) runs `if (r11 < w)` and handles **exactly ONE texel**, then jumps to the row
  advance rather than back to itself (@0x146f1c7). That is consistent: 2-at-a-time leaves at most
  one.
* the vector path uses `vmovups` load/store; the tail uses `vmovaps` (16-byte aligned).

**The two paths compute the same thing and the tail is the clearer statement of it.** Where the YMM
path clamps with `vmaxps`/`vminps` followed by `vblendps $0x11` (mask 0x11 = lane 0 of each 128-bit
half), the XMM path just uses **`vmaxss`/`vminss`** — scalar, lane 0 only. So: **only lane 0 of the
mask terms is clamped, and lanes 1..3 are dead**, which the tail of the function confirms —
`vshufps $0x0` @0x146efa3 broadcasts lane 0 before the mask is used. A transcription that clamps all
four lanes will still pass every static gate and will still be wrong.

**The clamp bounds are one scalar each, and the XMM path pins where they come from.**
`vinsertps $0x4e, %xmm11, %xmm0, %xmm6` @0x146f0ca means "element 1 of `B[0x100]`, zero the rest" —
i.e. the f32 at **bank +0x104**, which is exactly what the YMM path broadcasts @0x146ee95. The upper
bound is `B[0xa0]` lane 0 (`vbroadcastss 0xa0(%r14)` @0x146eea8, `vminss %xmm4` in the tail). Note
+0xa0 is read BOTH as a whole vector and as a broadcast scalar; a `SLOTS` table that lists it once
as `v` is fine for sensitivity but the port must not assume lane-uniformity.

**Bank offsets this kernel reads** — the `SLOTS` list for the oracle:

    0x00  v   the "one" the final mix lerps from      @0x146ee14
    0x20  v   RGB->Y   coefficients (vdpps $0x7f)     @0x146edee
    0x40  v   RGB->Cb  coefficients                   @0x146edf5
    0x60  v   RGB->Cr  coefficients                   @0x146ee02
    0x80  v   skin threshold A                        @0x146ee19
    0xa0  v   skin threshold B, and (lane 0) the clamp CEILING as a broadcast  @0x146ee22/@0x146eea8
    0xc0  v   skin threshold C                        @0x146ee2b
    0xe0  v   fabs mask (andps)                       @0x146ee7b
    0x100 v   the step scale (its lane 1 is the clamp FLOOR, read at +0x104)   @0x146ee88
    0x104 s   clamp floor, broadcast                  @0x146ee95
    0x120 v   the second threshold subtrahend         @0x146eec0
    0x140 v   the rsqrt/rcp correction constant       @0x146ef56
    0x160 v   the chroma-magnitude scale              @0x146ef6e
    0x180 v   YUV->RGB rows 0/2 (dpps $0x5f and $0x3f on the SAME slot)        @0x146efbb/@0x146efd1
    0x1a0 v   YUV->RGB row 1 (dpps $0x7f)             @0x146efc1

The file already carries the ctor's decoded constants (`RGB2Y_AT_0x15895c0`, `SKIN_LO_HI_AT_0x1589b20`,
… `ALPHA_LANE_MASK_AT_0x1589170_U32`), so the CTOR bank preset can be built from the SHIPPED file's
own constants rather than re-read out of Flexo.

**Alpha passes through**: `vblendps $0x88, %ymm0, %ymm1, %ymm0` @0x146efdd (and `$0x8` in the tail
@0x146f1bb) puts the ORIGINAL texel's lane 3 back before the store, so the alpha lane must be
bit-preserved — including a NaN payload, which is the corpus's job to check.

**AT&T operand order is the whole risk in this body.** `vsubps %ymm7, %ymm9, %ymm6` is
`ymm6 = ymm9 - ymm7`, `vcmpleps %ymm9, %ymm7, %ymm8` is `ymm8 = (ymm7 <= ymm9)`, and
`vmaxps %ymm6, %ymm13, %ymm7` is `max(src1=ymm13, src2=ymm6)` with x86's "return src2 if either is
NaN" rule. PORTING_SPEC's cheat-sheet covers the compare/branch case; in a body that is 90%
three-operand VEX arithmetic, write the Intel form in a comment next to each line and read it back.

## What to do with it

Claim it, and budget for the differential rather than the transcription — the transcription is
mechanical once the four notes above are in hand, and the differential is what makes it worth
anything. Two suggestions from the template's own design that apply here:

* keep the DEGENERATE tiles (w<=0, h<=0, negative) in the corpus and assert the poisoned destination
  is byte-identical: this kernel's `h<=0` path returns before building a frame, and that is a
  distinct code path from `w<2`;
* run the per-slot sensitivity probe. With fifteen bank slots and a body where four of them feed a
  `min` cascade, a slot with zero sensitivity means the corpus cannot tell a port that IGNORED that
  constant from one that used it — and on a mask cascade that is easy to arrange by accident.

## Evidence

The disassembly is regenerable in ~1s and is the same 227 lines every time:

    bash raw-port/tools/disasm.sh --sym __ZN11HgcVibrancy14RenderTile_AVXEP6HGTile Flexo
    -> raw-port/re/disasm/Flexo.__ZN11HgcVibrancy14RenderTile_AVXEP6HGTile.s (227 lines)

    arch -x86_64 /usr/bin/python3 raw-port/army/tools/probe_avx.py
    -> probe_avx: PASS (VEX.256 executes in-process at the cited addresses, exit 0)

and the drop that requeues the unit records the same summary, so a claimant who never reads `ops/`
still gets pointed here.
