// raw-port: OZDynamicCurve (chunk m2) — ProChannel.framework (channels layer)
//
// Framework binary: /tmp/ProChannel.x86_64 (macOS FCP x86_64 slice; VA == file offset).
// Chunk 2 ports methods [40..60) of OZDynamicCurve: the keypoint FLAG accessors (get/set flag
// bitfield, plus dedicated select/lock/openEdge/weightHandles/breakKeypointHandles setters and
// their is-*-Keypoint testers), enable/isEnabled/enableBehaviorFor/isBehaviorEnabledFor, and the
// handle-tangent setters (flattenHandles, setKeypointInputHandles, setKeypointOutputHandles,
// getKeypointInputHandles).
//
// See OZDynamicCurve.m0.ts for the object layout, base-class opaque brands, and BaseAccessors.
//
// ── Flag bitfield encoding recovered from the is-* getters (all read via OZSpline::getVertexFlags) ──
//   bit 0 (mask 0x001) : "handles are BROKEN"                                 areHandlesBroken @0x29151
//   bit 1 (mask 0x002) : "keypoint is LOCKED"                                 isLockedKeypoint @0x28e9f (shr 1)
//   bit 3 (mask 0x008) : "handles are WEIGHTED"                               areHandlesWeighted @0x2909a (shr 3)
//   bit 4 (mask 0x010) : "keypoint is SELECTED"                               isSelectedKeypoint @0x28de5 (shr 4)
//   bit 9 (mask 0x200) : "keypoint is on the OPEN EDGE"                       isOpenEdgeKeypoint @0x28f59 (shr 9)
//
// The corresponding setters call OZSpline::setVertexFlag / resetVertexFlag with the same MASK:
//   selectKeypoint(handle, true/false)         → setVertexFlag(h, 0x010) / resetVertexFlag(h, 0x010)
//   lockKeypoint  (handle, true/false)         → setVertexFlag(h, 0x002) / resetVertexFlag(h, 0x002)
//   setOpenEdgeKeypoint(handle, true/false)    → setVertexFlag(h, 0x200) / resetVertexFlag(h, 0x200)
//   weightHandles (handle, true/false)         → setVertexFlag(h, 0x008) / resetVertexFlag(h, 0x008)
//   breakKeypointHandles(handle, true/false)   → setVertexFlag(h, 0x001) / resetVertexFlag(h, 0x001)
//
// ── Frontier callees new to this chunk (throw-stubs; @0xADDR cited) ──
//   OZSpline::getVertexFlags(void*, unsigned int*)                      @0x28c42 (tail-jmp), 0x28ddc, 0x28e96, 0x28f50, 0x2908c, 0x29146
//   OZSpline::setVertexFlags(void*, unsigned int)                       @0x28c88 (tail-jmp)
//   OZSpline::setVertexFlag(void*, unsigned int)                        @0x28d81 (tail-jmp), 0x28e3b, 0x28ef5, 0x29031, 0x290eb
//   OZSpline::resetVertexFlag(void*, unsigned int)                      @0x28d99 (tail-jmp), 0x28e53, 0x28f0d, 0x29049, 0x29103
//   OZSpline::isEnabledVertex(void*, CMTime const&)                     @0x28d2a
//   OZSpline::flattenHandles(void*, CMTime const&)                      @0x2919c (tail-jmp)
//   OZDynamicSpline::enableVertex(void*, CMTime const&)                 @0x28cd7 (tail-jmp)
//   OZDynamicSpline::disableVertex(void*, CMTime const&)                @0x28cef (tail-jmp)
//   OZDynamicSpline::enableBehaviorForVertex(void*, bool)               @0x28fa3
//   OZDynamicSpline::enabledBehaviorForVertex(void*)                    @0x28fe1
//   OZDynamicSpline::setVertexInputHandles(void*, double, double, CMTime const&, bool)   @0x291f6 (tail-jmp)
//   OZDynamicSpline::setVertexOutputHandles(void*, double, double, CMTime const&, bool)  @0x29250 (tail-jmp)
//   OZDynamicSpline::getVertexInputHandles(void*, double*, double*, CMTime const&, bool) @0x292a5 (tail-jmp)
//   OZSpline::isValidHandle (already stubbed in m1 for m1's own sites — re-stubbed here for provenance)  many
//
// The is-* getters share a common shape:
//   1. Zero-init a `uint32_t flags` local (movl $0x0, -0x2c(%rbp)).
//   2. Guard: `if (!isValidHandle(h)) return 0;`  — return value (bool-in-al) is the isValidHandle
//      result (r14 spill).
//   3. `OZSpline::getVertexFlags(&self.spline, h, &flags)`.
//   4. `*outByte = (uint8) ((flags >> SHIFT) & 0x1);`
//   5. Return the isValidHandle result (u32-in-eax).
//
// The set-flag setters share:
//   1. `if (!isValidHandle(h)) return 0;`
//   2. If `flag == true`: tail-jmp OZSpline::setVertexFlag  (with mask arg)
//      Else:              tail-jmp OZSpline::resetVertexFlag(with mask arg)
//   (No local; the mask is a compile-time constant loaded via `movl $imm, %edx`.)

import { type CMTime } from "../infra/CMTime.js";
import {
  type OZDynamicCurve,
  type OZSplineOpaque,
} from "./OZDynamicCurve.m0.js";

// ────────────────────────────────────────────────────────────────────────────
// Undecoded frontier callees (Spec Rule 3).
// ────────────────────────────────────────────────────────────────────────────

/** OZSpline::isValidHandle(void*). Same symbol stubbed in m1; re-stubbed for m2's citation set. */
function OZSpline_isValidHandle(_spline: OZSplineOpaque, _handle: unknown): boolean {
  throw new Error(
    "raw-port: OZSpline::isValidHandle(void*) not yet transcribed " +
      "(called from OZDynamicCurve chunk 2 flag/handle accessors — many sites — ProChannel)",
  );
}

/** OZSpline::getVertexFlags(void*, unsigned int*). Reads the flag bitfield into *out.
 *  Tail-jmp @0x28c42; regular call @0x28ddc, 0x28e96, 0x28f50, 0x2908c, 0x29146. */
function OZSpline_getVertexFlags(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _outFlags: { value: number },
): boolean {
  throw new Error(
    "raw-port: OZSpline::getVertexFlags(void*, unsigned int*) not yet transcribed " +
      "(called from OZDynamicCurve::getKeypointFlags @0x28c42 / isSelectedKeypoint @0x28ddc / " +
      "isLockedKeypoint @0x28e96 / isOpenEdgeKeypoint @0x28f50 / areHandlesWeighted @0x2908c / " +
      "areHandlesBroken @0x29146 — ProChannel)",
  );
}

/** OZSpline::setVertexFlags(void*, unsigned int). Overwrites the flag bitfield.
 *  Tail-jmp @0x28c88. */
function OZSpline_setVertexFlags(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _newFlags: number,
): boolean {
  throw new Error(
    "raw-port: OZSpline::setVertexFlags(void*, unsigned int) not yet transcribed " +
      "(tail-called from OZDynamicCurve::setKeypointFlags(void*, unsigned int) " +
      "@0x28c88 — ProChannel)",
  );
}

/** OZSpline::setVertexFlag(void*, unsigned int). Sets specific bits (OR-in).
 *  Tail-jmp @0x28d81 / @0x28e3b / @0x28ef5 / @0x29031 / @0x290eb. */
function OZSpline_setVertexFlag(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _mask: number,
): boolean {
  throw new Error(
    "raw-port: OZSpline::setVertexFlag(void*, unsigned int) not yet transcribed " +
      "(tail-called from OZDynamicCurve::selectKeypoint @0x28d81 / lockKeypoint @0x28e3b / " +
      "setOpenEdgeKeypoint @0x28ef5 / weightHandles @0x29031 / breakKeypointHandles @0x290eb — ProChannel)",
  );
}

/** OZSpline::resetVertexFlag(void*, unsigned int). Clears specific bits (AND-out).
 *  Tail-jmp @0x28d99 / @0x28e53 / @0x28f0d / @0x29049 / @0x29103. */
function OZSpline_resetVertexFlag(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _mask: number,
): boolean {
  throw new Error(
    "raw-port: OZSpline::resetVertexFlag(void*, unsigned int) not yet transcribed " +
      "(tail-called from OZDynamicCurve::selectKeypoint @0x28d99 / lockKeypoint @0x28e53 / " +
      "setOpenEdgeKeypoint @0x28f0d / weightHandles @0x29049 / breakKeypointHandles @0x29103 — ProChannel)",
  );
}

/** OZSpline::isEnabledVertex(void*, CMTime const&). Call site @0x28d2a. */
function OZSpline_isEnabledVertex(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _t: CMTime,
): boolean {
  throw new Error(
    "raw-port: OZSpline::isEnabledVertex(void*, CMTime const&) not yet transcribed " +
      "(called from OZDynamicCurve::isEnabledKeypoint(void*, CMTime const&, bool*) " +
      "@0x28d2a — ProChannel)",
  );
}

/** OZSpline::flattenHandles(void*, CMTime const&). Tail-jmp @0x2919c. */
function OZSpline_flattenHandles(
  _spline: OZSplineOpaque,
  _handle: unknown,
  _t: CMTime,
): boolean {
  throw new Error(
    "raw-port: OZSpline::flattenHandles(void*, CMTime const&) not yet transcribed " +
      "(tail-called from OZDynamicCurve::flattenHandles(void*, CMTime const&) " +
      "@0x2919c — ProChannel)",
  );
}

/** OZDynamicSpline::enableVertex(void*, CMTime const&). Tail-jmp @0x28cd7. */
function OZDynamicSpline_enableVertex(
  _base: unknown,
  _handle: unknown,
  _t: CMTime,
): boolean {
  throw new Error(
    "raw-port: OZDynamicSpline::enableVertex(void*, CMTime const&) not yet transcribed " +
      "(tail-called from OZDynamicCurve::enableKeypoint(void*, bool, CMTime const&) " +
      "@0x28cd7 — ProChannel)",
  );
}

/** OZDynamicSpline::disableVertex(void*, CMTime const&). Tail-jmp @0x28cef. */
function OZDynamicSpline_disableVertex(
  _base: unknown,
  _handle: unknown,
  _t: CMTime,
): boolean {
  throw new Error(
    "raw-port: OZDynamicSpline::disableVertex(void*, CMTime const&) not yet transcribed " +
      "(tail-called from OZDynamicCurve::enableKeypoint(void*, bool, CMTime const&) " +
      "@0x28cef — ProChannel)",
  );
}

/** OZDynamicSpline::enableBehaviorForVertex(void*, bool). Call site @0x28fa3. */
function OZDynamicSpline_enableBehaviorForVertex(
  _base: unknown,
  _handle: unknown,
  _flag: boolean,
): void {
  throw new Error(
    "raw-port: OZDynamicSpline::enableBehaviorForVertex(void*, bool) not yet transcribed " +
      "(called from OZDynamicCurve::enableBehaviorForKeypoint(void*, bool) " +
      "@0x28fa3 — ProChannel)",
  );
}

/** OZDynamicSpline::enabledBehaviorForVertex(void*). Call site @0x28fe1. */
function OZDynamicSpline_enabledBehaviorForVertex(
  _base: unknown,
  _handle: unknown,
): boolean {
  throw new Error(
    "raw-port: OZDynamicSpline::enabledBehaviorForVertex(void*) not yet transcribed " +
      "(called from OZDynamicCurve::isBehaviorEnabledForKeypoint(void*, bool*) " +
      "@0x28fe1 — ProChannel)",
  );
}

/** OZDynamicSpline::setVertexInputHandles(void*, double, double, CMTime const&, bool).
 *  Tail-jmp @0x291f6. */
function OZDynamicSpline_setVertexInputHandles(
  _base: unknown,
  _handle: unknown,
  _a: number,
  _b: number,
  _t: CMTime,
  _flag: boolean,
): boolean {
  throw new Error(
    "raw-port: OZDynamicSpline::setVertexInputHandles(void*, double, double, CMTime const&, bool) " +
      "not yet transcribed (tail-called from OZDynamicCurve::setKeypointInputHandles(void*, " +
      "CMTime const&, double) @0x291f6 — ProChannel)",
  );
}

/** OZDynamicSpline::setVertexOutputHandles(void*, double, double, CMTime const&, bool).
 *  Tail-jmp @0x29250. */
function OZDynamicSpline_setVertexOutputHandles(
  _base: unknown,
  _handle: unknown,
  _a: number,
  _b: number,
  _t: CMTime,
  _flag: boolean,
): boolean {
  throw new Error(
    "raw-port: OZDynamicSpline::setVertexOutputHandles(void*, double, double, CMTime const&, bool) " +
      "not yet transcribed (tail-called from OZDynamicCurve::setKeypointOutputHandles(void*, " +
      "CMTime const&, double) @0x29250 — ProChannel)",
  );
}

/** OZDynamicSpline::getVertexInputHandles(void*, double*, double*, CMTime const&, bool).
 *  Tail-jmp @0x292a5. */
function OZDynamicSpline_getVertexInputHandles(
  _base: unknown,
  _handle: unknown,
  _outA: { value: number } | null,
  _outB: { value: number } | null,
  _t: CMTime,
  _flag: boolean,
): boolean {
  throw new Error(
    "raw-port: OZDynamicSpline::getVertexInputHandles(void*, double*, double*, CMTime const&, bool) " +
      "not yet transcribed (tail-called from OZDynamicCurve::getKeypointInputHandles(void*, " +
      "CMTime const&, double*) @0x292a5 — ProChannel)",
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Ported bodies (chunk 2 — 20 methods).
// ────────────────────────────────────────────────────────────────────────────

/**
 * OZDynamicCurve::getKeypointFlags(void* handle, unsigned int* outFlags). @0x28c0c.
 * @0x28c26 isValidHandle? → if false, xor eax; return 0.
 * @0x28c42 tail-jmp OZSpline::getVertexFlags(&self.spline, handle, outFlags).
 */
export function ozDynamicCurve_getKeypointFlags(
  self: OZDynamicCurve,
  handle: unknown,
  outFlags: { value: number },
): boolean {
  // @0x28c26
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  // @0x28c42
  return OZSpline_getVertexFlags(self.base as unknown as OZSplineOpaque, handle, outFlags);
}

/**
 * OZDynamicCurve::setKeypointFlags(void* handle, unsigned int newFlags). @0x28c54.
 * @0x28c6d isValidHandle? → if false return 0.
 * @0x28c88 tail-jmp OZSpline::setVertexFlags(&self.spline, handle, newFlags).
 */
export function ozDynamicCurve_setKeypointFlags(
  self: OZDynamicCurve,
  handle: unknown,
  newFlags: number,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  return OZSpline_setVertexFlags(self.base as unknown as OZSplineOpaque, handle, newFlags >>> 0);
}

/**
 * OZDynamicCurve::enableKeypoint(void* handle, bool flag, CMTime const& t). @0x28c9a.
 * @0x28cb8 isValidHandle? → if false return 0.
 * @0x28cca test bl,bl; je 0x28ce7  — if flag==false, take the DISABLE path.
 * @0x28cd7 tail-jmp OZDynamicSpline::enableVertex(&self.base, handle, t)
 * @0x28cef tail-jmp OZDynamicSpline::disableVertex(&self.base, handle, t)
 */
export function ozDynamicCurve_enableKeypoint(
  self: OZDynamicCurve,
  handle: unknown,
  flag: boolean,
  t: CMTime,
): boolean {
  // @0x28cb8
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  // @0x28cca
  if (flag) {
    // @0x28cd7
    return OZDynamicSpline_enableVertex(self.base, handle, t);
  } else {
    // @0x28cef
    return OZDynamicSpline_disableVertex(self.base, handle, t);
  }
}

/**
 * OZDynamicCurve::isEnabledKeypoint(void* handle, CMTime const& t, bool* out). @0x28cf4.
 * @0x28d15 valid = isValidHandle(handle);  (spilled to r13d)
 * @0x28d1d testb %al,%al ; je 0x28d31   — if !valid, skip write.
 * @0x28d2a *out = OZSpline::isEnabledVertex(&self.spline, handle, t)
 * @0x28d31 movl %r13d, %eax  — return valid.
 */
export function ozDynamicCurve_isEnabledKeypoint(
  self: OZDynamicCurve,
  handle: unknown,
  t: CMTime,
  out: { value: boolean },
): boolean {
  const valid = OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
  if (valid) {
    out.value = OZSpline_isEnabledVertex(self.base as unknown as OZSplineOpaque, handle, t);
  }
  return valid;
}

/**
 * OZDynamicCurve::selectKeypoint(void* handle, bool select). @0x28d44.
 * @0x28d5e isValidHandle? → if false return 0.
 * @0x28d6d movl $0x10, %edx   — flag mask = 0x10 (bit 4 = SELECTED)
 * @0x28d76 testb %r15b,%r15b ; je 0x28d93  — if select==false, RESET path.
 * @0x28d81 tail-jmp OZSpline::setVertexFlag(&self.spline, handle, 0x10)
 * @0x28d99 tail-jmp OZSpline::resetVertexFlag(&self.spline, handle, 0x10)
 */
export function ozDynamicCurve_selectKeypoint(
  self: OZDynamicCurve,
  handle: unknown,
  select: boolean,
): boolean {
  // @0x28d5e
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  // @0x28d6d flag mask 0x10, @0x28d76 branch on select
  if (select) {
    // @0x28d81
    return OZSpline_setVertexFlag(self.base as unknown as OZSplineOpaque, handle, 0x10);
  }
  // @0x28d99
  return OZSpline_resetVertexFlag(self.base as unknown as OZSplineOpaque, handle, 0x10);
}

/**
 * OZDynamicCurve::isSelectedKeypoint(void* handle, bool* out). @0x28d9e.
 * @0x28db5 movl $0, -0x2c(rbp)   — local flags = 0
 * @0x28dc3 valid = isValidHandle(handle)
 * @0x28dcd if !valid, skip.
 * @0x28ddc getVertexFlags(&self.spline, handle, &flags)
 * @0x28de1..0x28dea *out = (uint8)((flags >> 4) & 0x1)     — bit 4 = SELECTED
 * @0x28dec return valid.
 */
export function ozDynamicCurve_isSelectedKeypoint(
  self: OZDynamicCurve,
  handle: unknown,
  out: { value: boolean },
): boolean {
  const flags: { value: number } = { value: 0 };
  const valid = OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
  if (valid) {
    OZSpline_getVertexFlags(self.base as unknown as OZSplineOpaque, handle, flags);
    // @0x28de5 shrb $0x4, %al ; @0x28de8 andb $0x1, %al ; @0x28dea movb %al, (%rbx)
    // In JS: bit 4 of the low byte.
    out.value = ((flags.value >>> 4) & 0x1) !== 0;
  }
  return valid;
}

/**
 * OZDynamicCurve::lockKeypoint(void* handle, bool lock). @0x28dfe.
 * Pattern-identical to selectKeypoint but flag = 0x2 (bit 1 = LOCKED).
 * @0x28e18 isValidHandle ; @0x28e27 movl $0x2, %edx ; @0x28e30 branch ;
 * @0x28e3b setVertexFlag / @0x28e53 resetVertexFlag.
 */
export function ozDynamicCurve_lockKeypoint(
  self: OZDynamicCurve,
  handle: unknown,
  lock: boolean,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  if (lock) return OZSpline_setVertexFlag(self.base as unknown as OZSplineOpaque, handle, 0x2);
  return OZSpline_resetVertexFlag(self.base as unknown as OZSplineOpaque, handle, 0x2);
}

/**
 * OZDynamicCurve::isLockedKeypoint(void* handle, bool* out). @0x28e58.
 * Pattern-identical to isSelectedKeypoint but bit 1 (shrb $1, single-bit shift).
 * @0x28e9b..0x28ea3  *out = (uint8)((flags >> 1) & 0x1)     — bit 1 = LOCKED
 */
export function ozDynamicCurve_isLockedKeypoint(
  self: OZDynamicCurve,
  handle: unknown,
  out: { value: boolean },
): boolean {
  const flags: { value: number } = { value: 0 };
  const valid = OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
  if (valid) {
    OZSpline_getVertexFlags(self.base as unknown as OZSplineOpaque, handle, flags);
    out.value = ((flags.value >>> 1) & 0x1) !== 0;
  }
  return valid;
}

/**
 * OZDynamicCurve::setOpenEdgeKeypoint(void* handle, bool flag). @0x28eb8.
 * Pattern-identical to selectKeypoint but flag = 0x200 (bit 9 = OPEN-EDGE).
 * @0x28ee1 movl $0x200, %edx ; @0x28eea branch ; @0x28ef5 setVertexFlag / @0x28f0d resetVertexFlag.
 */
export function ozDynamicCurve_setOpenEdgeKeypoint(
  self: OZDynamicCurve,
  handle: unknown,
  flag: boolean,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  if (flag) return OZSpline_setVertexFlag(self.base as unknown as OZSplineOpaque, handle, 0x200);
  return OZSpline_resetVertexFlag(self.base as unknown as OZSplineOpaque, handle, 0x200);
}

/**
 * OZDynamicCurve::isOpenEdgeKeypoint(void* handle, bool* out). @0x28f12.
 * Pattern-identical to isSelectedKeypoint but bit 9 — uses a 32-bit MOV then shrl $0x9:
 * @0x28f55..0x28f5e  *out = (uint8)((flags >> 9) & 0x1)     — bit 9 = OPEN-EDGE.
 * (The getter reads flags via `movl (%r13), %eax` — 32-bit — because shifting-by-9 requires more
 * than the low byte; the other flag getters use shrb because they shift by <=8.)
 */
export function ozDynamicCurve_isOpenEdgeKeypoint(
  self: OZDynamicCurve,
  handle: unknown,
  out: { value: boolean },
): boolean {
  const flags: { value: number } = { value: 0 };
  const valid = OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
  if (valid) {
    OZSpline_getVertexFlags(self.base as unknown as OZSplineOpaque, handle, flags);
    out.value = ((flags.value >>> 9) & 0x1) !== 0;
  }
  return valid;
}

/**
 * OZDynamicCurve::enableBehaviorForKeypoint(void* handle, bool flag). @0x28f72.
 * @0x28f8d valid = isValidHandle(handle); (spilled to r12d)
 * @0x28f95 if !valid, skip.
 * @0x28f99 movzbl %r15b, %edx   — zero-extend flag byte to u32 for callee's arg.
 * @0x28fa3 callq OZDynamicSpline::enableBehaviorForVertex(&self.base, handle, [bool] edx)
 * @0x28fa8 return valid (r12d in eax).
 *
 * Note: unlike enableKeypoint (which BRANCHES on flag to pick enable vs disable), this method
 * FORWARDS `flag` to a single callee that accepts (handle, bool).
 */
export function ozDynamicCurve_enableBehaviorForKeypoint(
  self: OZDynamicCurve,
  handle: unknown,
  flag: boolean,
): boolean {
  const valid = OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
  if (valid) {
    OZDynamicSpline_enableBehaviorForVertex(self.base, handle, flag);
  }
  return valid;
}

/**
 * OZDynamicCurve::isBehaviorEnabledForKeypoint(void* handle, bool* out). @0x28fb4.
 * @0x28fcf valid = isValidHandle(handle); (spilled to r12d)
 * @0x28fd7 if !valid, skip.
 * @0x28fe1 *out = OZDynamicSpline::enabledBehaviorForVertex(&self.base, handle)
 * @0x28fe8 return valid.
 */
export function ozDynamicCurve_isBehaviorEnabledForKeypoint(
  self: OZDynamicCurve,
  handle: unknown,
  out: { value: boolean },
): boolean {
  const valid = OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
  if (valid) {
    out.value = OZDynamicSpline_enabledBehaviorForVertex(self.base, handle);
  }
  return valid;
}

/**
 * OZDynamicCurve::weightHandles(void* handle, bool flag). @0x28ff4.
 * Pattern-identical to selectKeypoint but flag = 0x8 (bit 3 = WEIGHTED).
 * @0x2901d movl $0x8, %edx ; @0x29026 branch ; @0x29031 setVertexFlag / @0x29049 resetVertexFlag.
 */
export function ozDynamicCurve_weightHandles(
  self: OZDynamicCurve,
  handle: unknown,
  flag: boolean,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  if (flag) return OZSpline_setVertexFlag(self.base as unknown as OZSplineOpaque, handle, 0x8);
  return OZSpline_resetVertexFlag(self.base as unknown as OZSplineOpaque, handle, 0x8);
}

/**
 * OZDynamicCurve::areHandlesWeighted(void* handle, bool* out). @0x2904e.
 * Pattern-identical to isSelectedKeypoint but bit 3 (shrb $3).
 * @0x29091..0x2909a  *out = (uint8)((flags >> 3) & 0x1)     — bit 3 = WEIGHTED.
 */
export function ozDynamicCurve_areHandlesWeighted(
  self: OZDynamicCurve,
  handle: unknown,
  out: { value: boolean },
): boolean {
  const flags: { value: number } = { value: 0 };
  const valid = OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
  if (valid) {
    OZSpline_getVertexFlags(self.base as unknown as OZSplineOpaque, handle, flags);
    out.value = ((flags.value >>> 3) & 0x1) !== 0;
  }
  return valid;
}

/**
 * OZDynamicCurve::breakKeypointHandles(void* handle, bool flag). @0x290ae.
 * Pattern-identical to selectKeypoint but flag = 0x1 (bit 0 = BROKEN).
 * @0x290d7 movl $0x1, %edx ; @0x290e0 branch ; @0x290eb setVertexFlag / @0x29103 resetVertexFlag.
 */
export function ozDynamicCurve_breakKeypointHandles(
  self: OZDynamicCurve,
  handle: unknown,
  flag: boolean,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  if (flag) return OZSpline_setVertexFlag(self.base as unknown as OZSplineOpaque, handle, 0x1);
  return OZSpline_resetVertexFlag(self.base as unknown as OZSplineOpaque, handle, 0x1);
}

/**
 * OZDynamicCurve::areHandlesBroken(void* handle, bool* out). @0x29108.
 * Pattern-identical to isSelectedKeypoint but bit 0 — NO shift:
 * @0x2914b..0x29151  *out = (uint8)(flags & 0x1)     — bit 0 = BROKEN.
 */
export function ozDynamicCurve_areHandlesBroken(
  self: OZDynamicCurve,
  handle: unknown,
  out: { value: boolean },
): boolean {
  const flags: { value: number } = { value: 0 };
  const valid = OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle);
  if (valid) {
    OZSpline_getVertexFlags(self.base as unknown as OZSplineOpaque, handle, flags);
    out.value = (flags.value & 0x1) !== 0;
  }
  return valid;
}

/**
 * OZDynamicCurve::flattenHandles(void* handle, CMTime const& t). @0x29166.
 * @0x29180 isValidHandle? → if false return 0.
 * @0x2919c tail-jmp OZSpline::flattenHandles(&self.spline, handle, t).
 */
export function ozDynamicCurve_flattenHandles(
  self: OZDynamicCurve,
  handle: unknown,
  t: CMTime,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  return OZSpline_flattenHandles(self.base as unknown as OZSplineOpaque, handle, t);
}

/**
 * OZDynamicCurve::setKeypointInputHandles(void* handle, CMTime const& t, double bias). @0x291ae.
 * @0x291b8  movsd %xmm0, -0x20(%rbp)   — spill bias
 * @0x291cd  isValidHandle? → if false return 0.
 * @0x291d6  xorps %xmm0, %xmm0          — xmm0 = 0.0
 * @0x291df  movsd -0x20(%rbp), %xmm1    — xmm1 = bias
 * @0x291e7  movl $0x1, %ecx             — bool (5th arg) = true
 * @0x291f6  tail-jmp OZDynamicSpline::setVertexInputHandles(&self.base, handle, 0.0, bias, t, true)
 *
 * i.e. the "INPUT-side" tangent is expressed as (a=0.0, b=bias) where `a` is the x-component and
 * `b` is the y-component; the callee likely rotates/scales these to build the input Bézier handle.
 * The final `bool=1` is a "reparametrize-after" flag or similar.
 */
export function ozDynamicCurve_setKeypointInputHandles(
  self: OZDynamicCurve,
  handle: unknown,
  t: CMTime,
  bias: number,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  return OZDynamicSpline_setVertexInputHandles(self.base, handle, 0.0, bias, t, true);
}

/**
 * OZDynamicCurve::setKeypointOutputHandles(void* handle, CMTime const& t, double bias). @0x29208.
 * Byte-for-byte identical to setKeypointInputHandles EXCEPT the tail-jmp target is
 * OZDynamicSpline::setVertexOutputHandles (@0x29250).
 */
export function ozDynamicCurve_setKeypointOutputHandles(
  self: OZDynamicCurve,
  handle: unknown,
  t: CMTime,
  bias: number,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  return OZDynamicSpline_setVertexOutputHandles(self.base, handle, 0.0, bias, t, true);
}

/**
 * OZDynamicCurve::getKeypointInputHandles(void* handle, CMTime const& t, double* outBias).
 * @0x29262.
 * @0x29280  isValidHandle? → if false return 0.
 * @0x2928f  xorl %edx,%edx      — 1st out ptr (double*) = null (i.e. caller doesn't want the x/a comp)
 * @0x29291  movq %r14, %rcx     — 2nd out ptr = original 3rd arg = outBias
 *   WAIT — let me re-check the arg mapping.
 *   OZDynamicCurve args:
 *     rdi = this, rsi = handle, rdx = &t (CMTime const&), rcx = outBias (double*)
 *   Prologue:
 *     @0x2926d  rcx → r14  ( = outBias )
 *     @0x29270  rdx → rbx  ( = &t )
 *     @0x29273  rsi → r15  ( = handle )
 *     @0x29276  rdi → r12  ( = this )
 *   Then:
 *     @0x29279  addq $0x8, %r12    ; r12 = &self.spline
 *     @0x2927d..0x29280  isValidHandle(handle)  (note: rsi=r15=handle preserved via SysV-abi save)
 *     @0x29289  movq %r12, %rdi   ; rdi = &self.spline (callee this)
 *     @0x2928c  movq %r15, %rsi   ; rsi = handle
 *     @0x2928f  xorl %edx,%edx    ; rdx = 0 (null double*)
 *     @0x29291  movq %r14, %rcx   ; rcx = outBias
 *     @0x29294  movq %rbx, %r8    ; r8 = &t
 *     @0x29297  movl $0x1, %r9d   ; r9 = 1 (bool)
 *     @0x292a5  tail-jmp OZDynamicSpline::getVertexInputHandles(&self.base, handle, [outA=]nullptr,
 *                                                                [outB=]outBias, &t, [b=]1)
 *
 * So the callee is invoked with the FIRST double* out (outA=x-comp) as nullptr and the SECOND
 * (outB=y-comp = "bias") as the caller's outBias. Symmetry match with setKeypointInputHandles
 * which passed (0.0, bias) — reads the "bias" (y-component) back.
 *
 * NOTE: NO null-check on outBias — the callee OZDynamicSpline::getVertexInputHandles must accept
 * a nullable outB pointer per its own spec. We forward `outBias` as-is (possibly null).
 */
export function ozDynamicCurve_getKeypointInputHandles(
  self: OZDynamicCurve,
  handle: unknown,
  t: CMTime,
  outBias: { value: number } | null,
): boolean {
  if (!OZSpline_isValidHandle(self.base as unknown as OZSplineOpaque, handle)) return false;
  return OZDynamicSpline_getVertexInputHandles(self.base, handle, null, outBias, t, true);
}

// ────────────────────────────────────────────────────────────────────────────
// Dispatch table (assemble_class.py convention: <Class>_m<k>_methods).
// ────────────────────────────────────────────────────────────────────────────

export const OZDynamicCurve_m2_methods = {
  "OZDynamicCurve::getKeypointFlags(void*, unsigned int*)":      ozDynamicCurve_getKeypointFlags,               // @0x28c0c
  "OZDynamicCurve::setKeypointFlags(void*, unsigned int)":       ozDynamicCurve_setKeypointFlags,               // @0x28c54
  "OZDynamicCurve::enableKeypoint(void*, bool, CMTime const&)":  ozDynamicCurve_enableKeypoint,                 // @0x28c9a
  "OZDynamicCurve::isEnabledKeypoint(void*, CMTime const&, bool*)":
                                                                 ozDynamicCurve_isEnabledKeypoint,              // @0x28cf4
  "OZDynamicCurve::selectKeypoint(void*, bool)":                 ozDynamicCurve_selectKeypoint,                 // @0x28d44
  "OZDynamicCurve::isSelectedKeypoint(void*, bool*)":            ozDynamicCurve_isSelectedKeypoint,             // @0x28d9e
  "OZDynamicCurve::lockKeypoint(void*, bool)":                   ozDynamicCurve_lockKeypoint,                   // @0x28dfe
  "OZDynamicCurve::isLockedKeypoint(void*, bool*)":              ozDynamicCurve_isLockedKeypoint,               // @0x28e58
  "OZDynamicCurve::setOpenEdgeKeypoint(void*, bool)":            ozDynamicCurve_setOpenEdgeKeypoint,            // @0x28eb8
  "OZDynamicCurve::isOpenEdgeKeypoint(void*, bool*)":            ozDynamicCurve_isOpenEdgeKeypoint,             // @0x28f12
  "OZDynamicCurve::enableBehaviorForKeypoint(void*, bool)":      ozDynamicCurve_enableBehaviorForKeypoint,      // @0x28f72
  "OZDynamicCurve::isBehaviorEnabledForKeypoint(void*, bool*)":  ozDynamicCurve_isBehaviorEnabledForKeypoint,   // @0x28fb4
  "OZDynamicCurve::weightHandles(void*, bool)":                  ozDynamicCurve_weightHandles,                  // @0x28ff4
  "OZDynamicCurve::areHandlesWeighted(void*, bool*)":            ozDynamicCurve_areHandlesWeighted,             // @0x2904e
  "OZDynamicCurve::breakKeypointHandles(void*, bool)":           ozDynamicCurve_breakKeypointHandles,           // @0x290ae
  "OZDynamicCurve::areHandlesBroken(void*, bool*)":              ozDynamicCurve_areHandlesBroken,               // @0x29108
  "OZDynamicCurve::flattenHandles(void*, CMTime const&)":        ozDynamicCurve_flattenHandles,                 // @0x29166
  "OZDynamicCurve::setKeypointInputHandles(void*, CMTime const&, double)":
                                                                 ozDynamicCurve_setKeypointInputHandles,        // @0x291ae
  "OZDynamicCurve::setKeypointOutputHandles(void*, CMTime const&, double)":
                                                                 ozDynamicCurve_setKeypointOutputHandles,       // @0x29208
  "OZDynamicCurve::getKeypointInputHandles(void*, CMTime const&, double*)":
                                                                 ozDynamicCurve_getKeypointInputHandles,        // @0x29262
} as const;
