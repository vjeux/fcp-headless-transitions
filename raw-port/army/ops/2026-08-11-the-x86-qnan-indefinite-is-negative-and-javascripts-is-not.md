# the x86 QNaN indefinite is NEGATIVE and JavaScript's is not

- **reported** 2026-08-11T20:26:55Z by worker-1
- **status** FIXED in the port it was found in (PR #658); OPEN as a repo-wide audit item

## Symptom

The differential for `HgcBT2100_HLG_InverseOETF::RenderTile_AVX` @Helium 0x3b1660 — a kernel with
no `vrcpps`, no `vdivps`, no `vsqrtps`, i.e. one whose every operation is exactly specified by
IEEE-754 — came back **420 divergent lanes out of 59,348**, and every single one of them was the
same pair of bit patterns:

    first: case 16 lane 14  native=ffc00000  ts=7fc00000

Not an ulp. Not a rounding-mode difference. One bit: the SIGN of a NaN.

## Root cause

**x86's "QNaN floating-point indefinite" — the value an SSE/AVX arithmetic instruction produces
when the OPERATION ITSELF is invalid (`Inf - Inf`, `0 * Inf`, …) — is `0xffc00000`, with the sign
bit SET.** Intel SDM vol 1 §4.8.3.7. JavaScript has exactly one NaN, and storing it into a
`Float32Array` gives `0x7fc00000`.

So the idiom every AVX port in this repo is written in —

```ts
ymm2[l] = Math.fround((ymm2[l] as number) - (ymm3[l] as number));
```

— differs from the machine in exactly one bit wherever an invalid operation is reachable. It is
silent, it is invisible to every static gate, and it only shows up in a bit-exact differential that
actually reaches the path. In this kernel it is reached the ordinary way: an infinite input texel
makes the exp2 argument `+Inf`, `vroundps` gives `+Inf`, and `f = e - floor(e)` is `Inf - Inf`.

The full rule, which is what the fix models, is also in the SDM: for a two-source op the result is
**src1's NaN quieted if src1 is NaN, else src2's quieted if src2 is NaN, else the indefinite**.
"src1" is the FIRST Intel source, i.e. the SECOND operand written in AT&T order — getting that
backwards would be a second, subtler version of the same bug.

## Fix / workaround

Model it. `raw-port/src/render/HgcBT2100_HLG_InverseOETF.ts` (PR #658) now carries

```ts
const QNAN_INDEFINITE = floatOf(0xffc00000);

function nanResult(src1: number, src2: number): number {
  if (Number.isNaN(src1)) return floatOf(bitsOf(src1) | 0x00400000);   // quiet an SNaN; QNaN unchanged
  if (Number.isNaN(src2)) return floatOf(bitsOf(src2) | 0x00400000);
  return QNAN_INDEFINITE;
}

function mulps(src1: number, src2: number): number {
  const r = Math.fround(src1 * src2);
  return Number.isNaN(r) ? nanResult(src1, src2) : r;
}
// addps / subps identically
```

and every arithmetic line in the kernel calls `addps`/`subps`/`mulps` with the operands in INTEL
order instead of writing `Math.fround(a op b)`. That took the same run to 0 divergences.

**Audit item for everyone else:** any landed port that writes `Math.fround(a * b)` on f32 lanes is
in the same position. It is not necessarily WRONG — the path has to be reachable — but its oracle
cannot tell you, because a corpus that never produces a NaN never compares one. Two cheap moves:

- add a NaN-pattern counter to your harness and print it, so "no NaN was ever compared" is visible
  rather than assumed:
  ```python
  from collections import Counter
  nanc = Counter(x for b in native for x in hexes(b)
                 if (int(x, 16) & 0x7f800000) == 0x7f800000 and (int(x, 16) & 0x7fffff))
  print("NATIVE NaN bit patterns in the output:", dict(nanc.most_common(6)))
  ```
- feed input texels with NON-CANONICAL NaN payloads (`0xffffffff`, `0x7f800001`, `0xffc0dead`), not
  just `float("nan")`. Python's `float("nan")` is `0x7fc00000` and will never catch a propagation
  difference.

## Evidence

Before, on the shipped file:

```
identity: nm addr 0x3b1660 == 0x3b1660; opcodes 8b460c2b46040f8e ...  match=True
tiles=378  f32 lanes compared=59348  of which inside the tile=38520  divergences=420
  first: case 16 lane 14 native=ffc00000 ts=7fc00000
  M0    420 divergent lanes — the port as shipped, re-run through the same wire
DIVERGED
```

After, same corpus, same file, only the three helpers added:

```
tiles=378  f32 lanes compared=59348  of which inside the tile=38520  divergences=0
  M0      0 divergent lanes — the port as shipped, re-run through the same wire
  M1  30336 divergent lanes — every buffer read shifted by 4 bytes
VERIFIED vs live Helium (bit-exact)
```

And the check that this is a REACHABILITY question rather than a universal one — the same worker's
two other kernels of the same family (PRs #648, #653) do NOT model the rule, and are nonetheless
clean, because no NaN ever reaches their output at all:

```
NATIVE NaN bit patterns seen in the output: {}
TS     NaN bit patterns seen in the output: {}
tiles=504  f32 lanes compared=78876  of which inside the tile=51360  divergences=0
VERIFIED vs live Helium (bit-exact)
```

(their first instruction is `vmaxps` against a floor, and MAXPS returns its second operand on an
unordered compare, so an input NaN is replaced before any arithmetic sees it — the structural reason,
not a lucky corpus. It was still worth measuring rather than asserting.)
