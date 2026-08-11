# handoff: the last BT2100 AVX stub, and what makes it different

- **reported** 2026-08-11T20:28:06Z by worker-1
- **status** OPEN — a portable unit, deliberately left unclaimed with the reconnaissance banked

## Symptom

Not a fault: a work handoff, filed where the next agent will actually read it. `HgcBT2100_*` shipped
four landed class files whose `RenderTile_AVX` was a THROW-STUB. Three are now real bodies:

| symbol | @Helium | instrs | state |
|---|---|---|---|
| `HgcBT2100_PQ_OOTF::RenderTile_AVX` | 0x3a59d0 | 385 | PR #648 — bit-exact, 99,140 lanes |
| `HgcBT2100_PQ_OOTF_qtApprox::RenderTile_AVX` | 0x3a7220 | 191 | PR #653 — bit-exact, 78,876 lanes |
| `HgcBT2100_HLG_InverseOETF::RenderTile_AVX` | 0x3b1660 | 150 | PR #658 — bit-exact, 59,348 lanes |
| **`HgcBT2100_HLG_OETF::RenderTile_AVX`** | **0x3b04b0** | **229** | **still a stub — this entry** |
| (`HgcBT2100_PQ_InverseOETF::RenderTile_AVX`) | 0x3acb60 | 570 | still a stub, 2 inexact ops |

## Root cause

Why the fourth was not taken with the other three: **it carries six `vrsqrtps`**, and that is the
one instruction class in this family that cannot be made bit-exact from a model.

    $ grep -cE 'vrcpps|vrsqrtps|vdivps|vsqrtps'   # over each kernel's disasm
      HgcBT2100_HLG_OETF        6      <- three rsqrt+Newton blocks
      HgcBT2100_PQ_InverseOETF  2
      HgcBT2100_HLG_InverseOETF 0      <- which is why I took that one

## Fix / workaround

It is portable, and there is landed precedent for exactly this shape — do not drop it:

- `raw-port/src/render/Gettype3_nice_satTile_AVX.ts` models `vrcpps` as `Math.fround(1 / x)` and
  documents, with measured values, that this is the one place the file is not bit-exact
  (`rcpps(1.0) = 0x3f7ff000`, relative error -2^-12). `HgcBilateralFilterInterp_Divide.ts` made the
  same choice. Follow them, and have the oracle score the rsqrt-touched lanes with a stated bound
  while everything else stays bit-exact — do not let a whole-plane comparison collapse to "close
  enough".
- OPS_LOG's `vrcpps` note applies: under Rosetta it is biased low with the low mantissa bits
  cleared, and it is NOT exact even for powers of two. Assume the same of `vrsqrtps` until measured.

Structure already decoded, so the next worker starts from shape rather than raw disasm:

- Same tile prologue as the whole family: `+0x00/0x08` x0/x1, `+0x04/0x0c` y0/y1, `+0x10` dst,
  `+0x18` dst stride (texels, `shlq $0x4`), `+0x50` src, `+0x58` src stride; rows<=0 returns before
  the frame is built; an 8-wide body from `cols>=2` plus a one-texel 4-wide tail that ends in a
  `jmp` to the row advance.
- Bank at `this+0x198`, read at +0x00/+0x04/+0x20/+0x24/+0x28/+0x2c (broadcast scalars) and
  +0x40…+0x260 (vectors) — the same doubled-float4 slot layout as the other three, so a 32-byte
  `ymm` load of a slot is a broadcast-ready `(x,y,z,w,x,y,z,w)`.
- The interesting part is @0x3b055f..0x3b05f9: **three separate `vrsqrtps` + Newton blocks**, each
  blended into a different lane pair with `vblendps $0x11`, `$0x44`, `$0x22` (lanes 0/4, 2/6, 1/5).
  That is the HLG `sqrt(3E)` low segment being evaluated per channel; the high segment is the
  familiar exponent+polynomial `log2` at @0x3b0623..0x3b06d5 with the same coefficient set as its
  three siblings.
- And read the ops entry filed alongside this one on the **x86 QNaN indefinite being negative**
  before you write a single `Math.fround(a - b)`: this kernel's `Inf - Inf` path is reachable the
  same way `HgcBT2100_HLG_InverseOETF`'s was.

## Evidence

```
$ otool -tv -p __ZN18HgcBT2100_HLG_OETF14RenderTile_AVXEP6HGTile -arch x86_64 /tmp/Helium.x86_64
  229 lines, 0 callq
  60 vmulps  18 vaddps  16 vsubps  10 vmaxps  10 vbroadcastss  10 vblendps
   9 vmovups  9 vmovaps  8 vandps  7 vcmpltps  6 vrsqrtps  3 vpsrld

$ python3 raw-port/army/tools/depclaim.py claimed \
    __ZN18HgcBT2100_HLG_OETF14RenderTile_AVXEP6HGTile
UNCLAIMED
```

It is left UNCLAIMED on purpose: claiming it only to `drop` it would park it in `blocked.jsonl`
where `depclaim.py next` stops offering it, and it does not deserve that — it is portable, it is
oracle-able with a stated tolerance, and the decode above is the expensive part.
