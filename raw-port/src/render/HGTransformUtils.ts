// HGTransformUtils.ts — Helium's transform-node geometry helpers
// (GetDOD, GetROI, MinW).
//
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGTransformUtils.GetDOD.s  @0x1b6920
//     __ZN16HGTransformUtils6GetDODEPK11HGTransform6HGRectff
//   raw-port/re/disasm/Helium.HGTransformUtils.GetROI.s  @0x1b7230
//     __ZN16HGTransformUtils6GetROIEPK11HGTransform6HGRectff
//   raw-port/re/disasm/Helium.HGTransformUtils.MinW.s    @0x1b7b10
//     __ZN16HGTransformUtils4MinWEv
//
// C++ signatures (from the demangled symbol names):
//   HGRect HGTransformUtils::GetDOD(HGTransform const*, HGRect, float, float);
//   HGRect HGTransformUtils::GetROI(HGTransform const*, HGRect, float, float);
//   float  HGTransformUtils::MinW();
//
// RIP-relative constants (resolved via raw-port/army/tools/resolve.py):
//   @Helium 0x3cb150   float32 = 0x358637bd = 9.999999974752427e-07 (~1e-6)
//                      (the "min-W" epsilon returned by MinW; also used
//                       as a numerical guard by callers of GetDOD/GetROI.)
//   @Helium 0x3cbad0   float32 = 0x39800000 = 0.000244140625 = 2^-12
//                      (grow-epsilon added to `zGrow` when the transform
//                       is NOT identity; leaves it alone when identity.)
//   @Helium 0x3c7cb0   two consecutive float32s [0.0f, 1.0f]
//                      (padding for the 4D (x, y, z=0, w=1) corner
//                       vectors sent through HGTransform::Transform.)
//
// vtable slots on HGTransform (resolved via
//   raw-port/army/tools/resolve.py Helium vtable HGTransform 0xd0 0xe0):
//     HGTransform vtable @0xa27188 ; installed ptr 0xa27198
//   *0xd0 -> 0x1b55e0   HGTransform::Transform(float*, float const*, int) const
//   *0xe0 -> 0x1b63b0   HGTransform::IsIdentity()                       const
//
// ---------------------------------------------------------------------------
// STATUS
//   MinW  — FULLY TRANSCRIBED. 7-instruction leaf that just returns the
//           `movss 0x213634(%rip), %xmm0` constant at @Helium 0x3cb150.
//   GetDOD, GetROI — NOT YET TRANSCRIBED. Both are ~500-line perspective
//           polygon clippers whose per-corner interpolation uses a stack
//           layout of four 4D corner-vectors [x,y,z=0,w=1] transformed
//           by HGTransform::Transform (vtable *0xd0 @Helium 0x1b55e0) which
//           is ITSELF undecoded, then perspective-divided/clipped against
//           a near-plane threshold and re-boxed by HGRectMake4f.
//           Per PORTING_SPEC Rule 3, they are throwing stubs citing their
//           source addresses so frontier.py sees the gap; do NOT approximate.
// ---------------------------------------------------------------------------

import type { HGRect } from './HGRect.js';

// ---------------------------------------------------------------------------
// HGTransformUtils::MinW @Helium 0x1b7b10
//
//   __ZN16HGTransformUtils4MinWEv:
//     0x1b7b10  pushq  %rbp
//     0x1b7b11  movq   %rsp, %rbp
//     0x1b7b14  movss  0x213634(%rip), %xmm0     ; -> load [rip+0x213634] = 0x3cb150
//     0x1b7b1c  popq   %rbp
//     0x1b7b1d  retq
//
//   The single load at 0x1b7b14 references @Helium 0x3cb150; the 4-byte
//   float32 at that address is 0x358637bd = 9.999999974752427e-07 (~1e-6).
//   No callees, no branches; pure constant-return leaf.
// ---------------------------------------------------------------------------
export function HGTransformUtils_MinW(): number {
  // float32 constant @Helium 0x3cb150 (bit-pattern 0x358637bd).
  return Math.fround(9.999999974752427e-7);
}

// ---------------------------------------------------------------------------
// HGTransformUtils::GetDOD @Helium 0x1b6920
//
//   Signature (from the mangled name):
//     static HGRect GetDOD(HGTransform const* t, HGRect r, float grow, float wMin);
//
//   Structure recovered from the disasm (not yet transcribed):
//     1. @0x1b6961  callq _HGRectIsNull(r); if null -> return HGRectNull
//                   @0x1b696a leaq _HGRectNull(%rip),%rcx ; return its bytes.
//     2. @0x1b69ac-@0x1b69b2  callq *0xe0(this)  ; HGTransform::IsIdentity() const
//                             @Helium 0x1b63b0 — NOT YET TRANSCRIBED.
//     3. Compute `xmm4` = arg-`grow` (xmm0) if identity, else grow + epsilon
//        (epsilon = f32 @Helium 0x3cbad0 = 0.000244140625 = 2^-12).   @0x1b69ce
//     4. Build four 4D corner vectors {[x0-e, y0-e, 0, 1], [x1+e, y0-e, 0, 1],
//        [x1+e, y1+e, 0, 1], [x0-e, y1+e, 0, 1]} on the stack at -0x70..-0x40,
//        using the (0.0, 1.0) f32 pair @Helium 0x3c7cb0 for z/w.
//     5. @0x1b6a61  callq *0xd0(this)  ; HGTransform::Transform(dst, src, 4) const
//                             @Helium 0x1b55e0 — NOT YET TRANSCRIBED.
//     6. Test each corner's transformed w against arg-`wMin` (xmm6=xmm1).
//        Build a 4-bit mask of "corners whose w < wMin". If ==0xf, return
//        HGRectNull. If !=0, run the near-plane polygon-clip which walks
//        each of 4 edges, linearly interpolating (t = (wMin - w0)/(w1 - w0))
//        against the failing endpoints, producing up to 6 output corners.
//     7. Perspective-divide xy by w for each output corner @0x1b7019-0x1b70d4.
//     8. min/max reduce the projected xy across the surviving corners with
//        NaN-safe SSE blendvps @0x1b70e0-0x1b721f.
//     9. @0x1b717b callq _HGRectMake4f with (min.x - grow, min.y - grow,
//                                             max.x + grow, max.y + grow).
//
//   Per PORTING_SPEC Rule 3 this must not be approximated while
//   HGTransform::Transform @0x1b55e0 and HGTransform::IsIdentity @0x1b63b0
//   are un-transcribed; a plausible-looking algorithm would silently corrupt
//   every downstream renderer that consumes DOD boxes.
// ---------------------------------------------------------------------------
export function HGTransformUtils_GetDOD(
  _t: unknown,
  _r: HGRect,
  _grow: number,
  _wMin: number,
): HGRect {
  throw new Error(
    'HGTransformUtils::GetDOD @Helium 0x1b6920 not yet transcribed ' +
      '(depends on HGTransform::Transform @Helium 0x1b55e0 and ' +
      'HGTransform::IsIdentity @Helium 0x1b63b0).',
  );
}

// ---------------------------------------------------------------------------
// HGTransformUtils::GetROI @Helium 0x1b7230
//
//   Signature (from the mangled name):
//     static HGRect GetROI(HGTransform const* t, HGRect r, float grow, float wMin);
//
//   Structure recovered from the disasm (not yet transcribed):
//     1. @0x1b726a  callq *0xe0(this)  ; HGTransform::IsIdentity() const
//                             @Helium 0x1b63b0 — NOT YET TRANSCRIBED.
//        (Result kept in %ebx for a late-branch @0x1b732c that takes an
//         identity fast-path @0x1b748f; the non-identity branch performs
//         the same corner-transform+clip pipeline as GetDOD.)
//     2. @0x1b7275  cvtdq2ps on r's [x0|y0] then addps a 4-lane f32 constant
//        at rip+0x212d71 = @Helium ~0x3c9ff0 (NOT resolved here — needed for
//        faithful ROI expansion); analogous cvtdq2ps+addps for [x1|y1] at
//        rip+0x212d57 = @Helium ~0x3c9fd0.
//     3. @0x1b727f  movsd rip+0x210a29 = @Helium 0x3c7cb0 = [0.0f, 1.0f]
//        for the z/w padding of the corner vectors.
//     4. Builds 4 corner vectors at -0x60..-0x28, then
//        @0x1b72de  callq *0xd0(this)  ; HGTransform::Transform(dst, src, 4)
//                             @Helium 0x1b55e0 — NOT YET TRANSCRIBED.
//     5. From @0x1b72e4 onward the pipeline is structurally identical to
//        GetDOD (per-corner w-test → 4-bit mask → all-fail → HGRectNull,
//        identity-fast-path when %ebx==0, else clip/persp-div/min-max/
//        HGRectMake4f). The 4-lane f32 constants above (rip+0x212d71,
//        rip+0x212d57) still need to be resolved before this can be safely
//        transcribed.
//
//   Per PORTING_SPEC Rule 3 this stays a throwing stub while the two
//   HGTransform vtable slots are un-transcribed and the two unresolved
//   constants above have not been read out of the binary.
// ---------------------------------------------------------------------------
export function HGTransformUtils_GetROI(
  _t: unknown,
  _r: HGRect,
  _grow: number,
  _wMin: number,
): HGRect {
  throw new Error(
    'HGTransformUtils::GetROI @Helium 0x1b7230 not yet transcribed ' +
      '(depends on HGTransform::Transform @Helium 0x1b55e0 and ' +
      'HGTransform::IsIdentity @Helium 0x1b63b0).',
  );
}

// ---------------------------------------------------------------------------
// Numeric self-checks (transcribed from MinW's constant @Helium 0x3cb150):
//   HGTransformUtils_MinW()       -> 9.999999974752427e-7  (f32 0x358637bd)
//   HGTransformUtils_MinW() > 0   -> true
// ---------------------------------------------------------------------------
