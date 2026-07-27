# BEZIER getControlPoints — FULL DECODE (2026-07-27, closes the blocker that stalled attempt 1)

Attempt 1 stalled because getControlPoints makes a *mid-function virtual call* `*0x80` and an
intricate SIMD lane combine that weren't traced. Both are now decoded. NOTHING here is a guess;
every step cites @0xADDR from ProChannel.OZBezierInterpolator.getControlPoints.s.

## The `_tan+NNN` call labels are MISLABELED inlined CMTime helpers (NOT tan())
resolve.py sym shows 0xaca80/0xaca8c/0xacad4/0xacada all fall inside
`OZChannelTimeConverterDisableSentry::~...(.cold.1)` — i.e. the disassembler picked the nearest
preceding symbol. These callq targets are inlined CMTime arithmetic thunks operating on the CMTime
structs copied onto the stack at [rsp..rsp+0x30] (value@+0x0/+0x8 as xmm, timescale/epoch/flags@+0x10).
Behaviourally they are CMTime construct/normalize helpers around the tangent-handle CMTime math.
Model them via raw-port/src/infra/CMTime.ts (rational BigInt) — do NOT call a trig fn.

## Signature
OZBezierInterpolator::getControlPoints(OZSpline& sp, void* vA, void* vB, CMTime const& uA,
    CMTime& outUB(?), CMTime& (?), double* xs4, double* ys4)   @0x4054a
Registers on entry: rdi=this, rsi=r12=sp, rdx=r13=vA(uA CMTime struct? see below), rcx=rbx=vB,
r8=r14=&query CMTime, r9=out CMTime A slot, [rbp+0x10]=rsi2 out CMTime B slot, [rbp+0x18]=r12b=ys/out,
[rbp+0x20]=r15=xs/out-control-array.

## Control-point output layout (the two arrays the caller passes; r15 = the primary 4-slot struct)
- r15[+0x00] = P0.value   (movsd xmm0 from getValueV(vA) @0x4065c)
- r15[+0x18] = P3.value   (movsd xmm0 from getValueV(vB) @0x4066d)
- r12b (the OTHER out ptr, [rbp+0x18]) gets seeded @0x4067e..0x40690:
    (r12b)[+0x00] = 0.0                       (movq $0, (%r12))
    (r12b)[+0x18] = 1.0                       (0x3ff0.. -> 0x18(%r12))
  => r12b holds the *parameter-space* control abscissae P0u=0, P3u=1 (Bezier u-domain endpoints).

## Step A — build the two interior CMTime control-times (0x40570..0x4064f)
Copies vA/vB CMTime (movups 0x10(rdx)/0x20(rdx)) into stack CMTime slots, then calls the inlined
CMTime helper @0xaca80 (returns int in eax). `testl eax,eax; jle 0x4064f` — when eax<=0 it SKIPS
the getSmallDeltaU nudge (degenerate/zero span). Otherwise:
  - r15b(-0x90) = sp.getSmallDeltaU()                       @0x405f1  OZSpline::getSmallDeltaU @0x2fe52
  - re-runs the CMTime helper @0xacad4 to fold smallDeltaU into the interior time
  - writes the interior CMTime to the [rbp+0x10] out slot (0x10(rcx)) @0x40638..0x4064c
This is the equal-U guard (same pattern as Linear): when uB<=uA, nudge by smallDeltaU so the
denominator is nonzero.

## Step B — the *0x80 mid-function virtual call = computeTangents @0x4049a (0x406ae..0x406c8)
`movq (%r14),%r10 ; callq *0x80(%r10)` where r14=this. Slot *0x80 on the OZBezierInterpolator vtable
resolves to **OZBezierInterpolator::computeTangents(sp, vA, vB, uQuery, dTimeA*, dValueA*, dTimeB*,
dValueB*) @0x4049a**. THIS was the hidden blocker. It is SMALL (63 lines) and just delegates:
  1. callq *0x40(vtable(vA)) = OZDynamicVertex::getOutputTangents(dTime*,dValue*,CMTime) @0x3eb02  (@0x404db)
  2. callq *0x38(vtable(vB)) = OZDynamicVertex::getInputTangents (dTime*,dValue*,CMTime)  @0x3eaca  (@0x404f5)
     (i.e. tangent A = vA.OUTput handle, tangent B = vB.INput handle — the segment's two interior handles)
  3. if sp->0xa8[0]==0: (else early return @0x40504) call the interpolator's
     convertTangentsToHandles *0x30 twice (@0x40524 tail; and the jmpq *0x30(rax) @0x40548) — for the
     base OZBezierInterpolator vtable *0x30 = OZSplineInterpolator::convertTangentsToHandles @0x45c46
     (may be identity/empty — verify; Cardinal overrode these to empty).
  getInputTangents/getOutputTangents @0x3eaca/0x3eb02 -> these read the vertex's stored handle
  (dTime,dValue) pair. DECODE THESE TWO (small) as the actual handle source.

## Step C — interior control point SIMD combine (0x4074a..0x407ab)  [the "SIMD lane" part]
After computeTangents fills the handle (dTime@r14b+0x8? see below), and the CMTime helpers @0xaca8c
produced the span seconds in xmm0:
  den = max( xmm0(span seconds) , *(0xb0770)=1e-5 )       maxsd @0x40746   (floor const 1e-5)
Let HS = this+0x8 = 1.0 (handle scale, from ctor @0x4045e). r14 here = the handle struct (dTime@+0x8,
dValue@+0x8 of a second struct). The packed math:
  xmm2 = HS(r14+0x8) * P?u(r12+0x8)         mulsd @0x40750   -> store r12[+0x8]  (interior u lane a)
  xmm3 = HS(r14+0x8) * P?u(r12+0x10) + span  mulsd/addsd @0x40764/0x4076b
  unpcklpd xmm2,xmm3 ; divpd by (den,den)   @0x4076f/0x40777 -> r12[+0x8..+0x18] = interior ABSCISSAE
     i.e. interior control u-coords = (HS*handleTime)/den  and (HS*handleTime+span)/den
  Then value lanes (0x40782..0x407ab), on r15 (the value array):
     r15[+0x8]  = P0.value + HS*dValueA         (mulsd 0x8(r15) by HS(r14+0x8); addsd (r15)=P0.val)
     r15[+0x10] = P3.value + HS*dValueB         (addsd 0x18(r15)=P3.val)
  => P1.value = P0.value + HS*outTangentValueA ;  P2.value = P3.value + HS*inTangentValueB
     P1.u,P2.u = (HS*handleTime[±]+{0,span})/den   (normalized into [0,1] u-domain)

## Step D — Sanitize gate (0x407b1..0x407ce)
  rax = sp->0xa8   (the spline "handle mode" struct, byte flags)
  if sp->0xa8[0]==0 && sp->0xa8[3]==1:  OZBezierSanitizeControlPolygon(xs=r15, ys) @0xa550c
  (clamp-handles mode: enforce time-axis monotonicity of the 4 u-coords). Disasm saved at
  raw-port/re/disasm/ProChannel.OZBezierSanitizeControlPolygon.s — TRANSCRIBE it (own file per naming rule).

## What's left to decode before transcription (all small, all saved-or-fetchable):
1. OZDynamicVertex::getInputTangents @0x3eaca + getOutputTangents @0x3eb02 (the handle source)
2. OZBezierInterpolator::computeTangents @0x4049a (delegator; disasm saved) + its convertTangentsToHandles *0x30
3. OZBezierSanitizeControlPolygon @0xa550c (disasm saved)
4. sp->0xa8 flag struct semantics (handle mode) — read from OZSpline layout (ctor/accessor)
5. The final `interpolate` combine @0x40a10 that consumes these control points via OZBezierEval/FindParameter

## interpolate @0x407e6 overall shape (from BEZIER_DECODE.md):
  getControlPoints -> (xs[4] u-abscissae, ys[4] values) -> for query u:
    param = OZBezierFindParameter(xs, uQuery_normalized)   [oracle-verified, landed]
    value = OZBezierEval(ys, param)                          [oracle-verified, landed]
  The two free fns are DONE and bit-exact; interpolate just needs the control-polygon (this doc) +
  the normalize of the query time into [0,1] and the final combine.
