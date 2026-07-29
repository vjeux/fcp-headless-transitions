// OZ360Camera — an OZScene-anchored 360-degree camera. Subclasses LiSimpleCamera and
// participates in PCShared_base refcounting. Owns a pointer back to its scene at
// this+0x208 and reads the "active camera" out of the scene each frame to derive
// its translation/rotation/angle-of-view.
//
// Transcribed from the x86_64 slice of:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// Disassembly captured at:
//   raw-port/re/disasm/OZ360Camera.OZ360Camera.s      (37 lines)
//   raw-port/re/disasm/OZ360Camera.getCrop.s          ( 7 lines)  — DECODED
//   raw-port/re/disasm/OZ360Camera.reset.s            (11 lines)  — DECODED
//   raw-port/re/disasm/OZ360Camera.getAngleOfView.s   (43 lines)  — DECODED
//   raw-port/re/disasm/OZ360Camera.getTranslation.s   (110 lines) — throw-stub (needs OZCamera+PCVector3 graph)
//   raw-port/re/disasm/OZ360Camera.getRotation.s      (99 lines)  — throw-stub (needs OZCamera+PCQuat graph)
//
// Twelve exported symbols owned by this class (all @Ozone):
//   0x448440  C1                                     — throw-stub (LiSimpleCamera base + PCShared_base + setCameraModel(0))
//   0x4484b0  C2  OZ360Camera::OZ360Camera(OZScene*) — throw-stub (see ctor disasm; frontier callees)
//   0x448550  getCrop() const                        — DECODED (returns true)
//   0x448560  getTranslation(PCVector3<double>*)     — throw-stub
//   0x448720  getActiveCamera(CMTime) const          — throw-stub
//   0x448780  getRotation(PCQuat<double>*)           — throw-stub
//   0x448930  setRotation(PCQuat<double> const&)     — throw-stub
//   0x448af0  getAngleOfView() const                 — DECODED (with a frontier OZChannel::getValueAsDouble stub)
//   0x448b90  reset()                                — DECODED
//   0x448bc0  setScene(OZScene*)                     — throw-stub
//   0x448c90  ~OZ360Camera()                         — throw-stub
//   0x448ce0  ~OZ360Camera()                         — throw-stub
//
// Class layout (proved by ctor + reset stores + getAngleOfView/getTranslation reads):
//   this+0x000  vtable "OZ360Camera"   (installed @0x4484e6-0x4484ed; RIP target = vtable+0x10)
//   this+0x008..0x03F LiSimpleCamera base subobject (ctor calls LiSimpleCameraC2 @0x6ddc62)
//   this+0x040  double  cropScale (?)    — reset writes 1.0 (0x3FF0000000000000)   @0x448b94
//   this+0x048  double  ?                — reset writes 0.0 (xmm0 xor)              @0x448ba5
//   this+0x050  double  ?                — same movups store (16-byte pair with +0x48)
//   this+0x058  u64     ?                — reset writes 0                           @0x448ba9
//                                            (These three could be a PCVector3<double> {y=0,z=0}
//                                             plus a state flag. See reset() decode below —
//                                             faithful port stores the raw bit patterns; naming
//                                             is deferred until getters/setters expose the
//                                             semantics of each field.)
//   this+0x208  OZScene*  scene           (ctor @0x4484fe; getAngleOfView loads @0x448afc)
//   this+0x210  vtable "PCShared_base"    (ctor @0x4484bd install; PCShared_base at [+0x210])
//   this+0x218  u64       refcount/next   (ctor zeros @0x4484cf)

import type { CMTime } from "../infra/CMTime";

/** Frontier stub for OZScene — this class is transcribed elsewhere. We only need its type. */
export type OZSceneLike = object;

/** Frontier stub — `PCVector3<double>*`. Real struct is 3 doubles at +0x00 (x), +0x08 (y),
 *  +0x10 (z). getTranslation is a throw-stub so this type is only referenced by signature. */
export interface PCVector3D { x: number; y: number; z: number; }

/** Frontier stub — `PCQuat<double>`. Real struct is 4 doubles (w,x,y,z). getRotation/setRotation
 *  are throw-stubs so this type is only referenced by signature. */
export interface PCQuatD { w: number; x: number; y: number; z: number; }

// ────────────────────────────────────────────────────────────────────────────────────────
// State model — mirrors the C++ layout. Only the fields WRITTEN or READ by decoded methods
// are named; the four raw doubles at +0x40..+0x58 keep raw doc names + offsets until
// the setter that exposes their semantic meaning is decoded.
// ────────────────────────────────────────────────────────────────────────────────────────

export interface OZ360CameraState {
  /** this+0x40 double — reset()'s first store: movabsq $0x3FF0000000000000 -> 1.0. */
  field_0x40: number;
  /** this+0x48 double — reset()'s xorps+movups pair (low half). Written to 0.0. */
  field_0x48: number;
  /** this+0x50 double — reset()'s xorps+movups pair (high half). Written to 0.0. */
  field_0x50: number;
  /** this+0x58 u64    — reset()'s movq $0 store. */
  field_0x58: bigint;
  /** this+0x208 OZScene* — set by ctor to the argument; read by getAngleOfView/etc. */
  scene: OZSceneLike | null;
}

// ────────────────────────────────────────────────────────────────────────────────────────
// OZ360Camera::OZ360Camera(OZScene*)  @Ozone 0x4484b0 (C2) / @0x448440 (C1)
//
// Full disasm (37 lines). Full body is a chained subobject construction:
//   1. Install PCShared_base vtable @this+0x210 (@0x4484bd..0x4484c8): the RIP-relative
//      symbol is "vtable for PCShared_base", + 0x10 offset (the standard trick).
//   2. Zero the PCShared_base refcount slot @this+0x218 (@0x4484cf).
//   3. Call LiSimpleCamera::LiSimpleCamera() base ctor (@0x4484e1 stub 0x6ddc62). This
//      is the actual scene-graph camera object at this+0x008..0x1FF.
//   4. Install our own vtable @this+0x000 (@0x4484e6..0x4484ed) — the top-level camera vtable
//      that overrides LiSimpleCamera's virtuals for the 360-camera specialisation.
//   5. Install a SECOND vtable @this+0x210 (@0x4484f0..0x4484f7) — this REPLACES the
//      PCShared_base install from step 1 with the OZ360Camera-specific PCShared_base
//      vtable (the pattern for a class multiply-inheriting PCShared_base — the second install
//      picks the correct thunks for this class).
//   6. Store the OZScene* argument @this+0x208 (@0x4484fe).
//   7. Call LiSimpleCamera::setCameraModel(LiCameraModel::0) (@0x448508 stub 0x6ddc4a) —
//      the enum "0" is the SPHERICAL_360 model (name recovered from convention; the raw
//      immediate is 0).
//
// Exception unwind path (fall-through @0x448514+): LiSimpleCamera::~LiSimpleCamera() then
// PCShared_base::~PCShared_base(), then _Unwind_Resume — the standard try/rethrow tail.
//
// Frontier callees (all cited, none decoded):
//   __ZN14LiSimpleCameraC2Ev                 base ctor
//   __ZN14LiSimpleCamera14setCameraModelE... setCameraModel enum setter
//   __ZN13PCShared_baseD2Ev                  PCShared_base dtor (unwind path)
//
// Full port needs the LiSimpleCamera and PCShared_base ports before it can install real
// vtables; here we produce the JS state mirror with the observable field defaults.
// ────────────────────────────────────────────────────────────────────────────────────────

/**
 * Construct an OZ360Camera state mirror for the given scene. Faithful to reset()'s field
 * defaults but does NOT wire LiSimpleCamera / PCShared_base subobjects — those live behind
 * throw-stubs at their own class ports.
 */
export function newOZ360Camera(scene: OZSceneLike): OZ360CameraState {
  const s: OZ360CameraState = {
    field_0x40: 0,
    field_0x48: 0,
    field_0x50: 0,
    field_0x58: 0n,
    scene,
  };
  // reset() is not called from the ctor in the disasm — the four fields at +0x40..+0x58 are
  // NOT initialised by C2 (they inherit whatever LiSimpleCamera's base ctor left there).
  // We initialise them to zero here for a well-defined JS state; a caller that needs the
  // "reset" defaults must invoke reset(s) explicitly.
  return s;
}

// ────────────────────────────────────────────────────────────────────────────────────────
// OZ360Camera::getCrop() const  @Ozone 0x448550   —   returns `true` unconditionally.
//
// Full disasm (7 lines):
//   0x448550  push %rbp; mov %rsp, %rbp
//   0x448554  mov  $0x1, %al                       ; return true
//   0x448556  pop %rbp; ret
// ────────────────────────────────────────────────────────────────────────────────────────

export function getCrop(_state: OZ360CameraState): boolean {
  return true;                                                     // @0x448554
}

// ────────────────────────────────────────────────────────────────────────────────────────
// OZ360Camera::reset()  @Ozone 0x448b90
//
// Full disasm (11 lines):
//   0x448b90  push %rbp; mov %rsp, %rbp
//   0x448b94  movabsq $0x3FF0000000000000, %rax    ; rax = bit-pattern of double 1.0
//   0x448b9e  mov  %rax, 0x40(%rdi)                ; this->field_0x40 = 1.0
//   0x448ba2  xorps %xmm0, %xmm0                   ; xmm0 = 0.0
//   0x448ba5  movups %xmm0, 0x48(%rdi)             ; this->field_0x48 = this->field_0x50 = 0.0
//   0x448ba9  movq $0x0, 0x58(%rdi)                ; this->field_0x58 = 0
//   0x448bb1  pop %rbp; ret
//
// The 16-byte movups pairs (0x48, 0x50) as a single 16-byte store of zeros.
// ────────────────────────────────────────────────────────────────────────────────────────

export function reset(state: OZ360CameraState): void {
  state.field_0x40 = 1.0;                                          // @0x448b94..0x448b9e
  state.field_0x48 = 0.0;                                          // @0x448ba2..0x448ba5 (low half of movups)
  state.field_0x50 = 0.0;                                          // @0x448ba5             (high half of movups)
  state.field_0x58 = 0n;                                           // @0x448ba9
}

// ────────────────────────────────────────────────────────────────────────────────────────
// OZ360Camera::getAngleOfView() const  @Ozone 0x448af0
//
// Full disasm (43 lines):
//   1. Load scene = this+0x208.                                          @0x448afc
//   2. Call OZScene::getCurrentTime() -> CMTime tmp {value@-0x68, tscale@-0x58/-0x50/-0x30}.
//      The CMTime layout is: value (i64) @+0, timescale (i32) @+8, flags (u32) @+12,
//      epoch (i64) @+16. The stack marshalling reshuffles the fields into a stable local
//      copy at -0x40..-0x30 (the standard by-value-CMTime local for downstream calls).
//                                                                       @0x448b07 stub
//   3. Call OZScene::getActiveCamera(CMTime const&) -> uint32 cameraId. @0x448b27 stub
//   4. Call OZScene::getNode(cameraId) -> OZSceneNode*. If null -> jump to default 90.0.
//                                                                       @0x448b35 stub
//   5. dynamic_cast<OZCamera*>(sceneNode) — if null -> jump to default. @0x448b52 stub
//   6. camera_ptr += 0x1A90 -> OZChannel* — this is the AngleOfView channel embedded in
//      OZCamera at fixed offset 0x1A90.                                 @0x448b5c
//   7. Call OZChannel::getValueAsDouble(CMTime const&, double)
//      with the CMTime local and 0.0 as the fallback-if-unset value.
//      xorps %xmm0, %xmm0 provides the 0.0 second-arg.                  @0x448b6c stub
//   8. Return the double in %xmm0.
//
// Default (no active camera / not an OZCamera) path @0x448b78:
//   movsd 0x2be390(%rip), %xmm0  ->  double @0x706F10 = 90.0
//   return.
//
// The frontier callees are all real functions (typenames given for the stubs below):
//   OZScene::getCurrentTime()                                 @Ozone (its own class port)
//   OZScene::getActiveCamera(CMTime const&)                   @Ozone (its own class port)
//   OZScene::getNode(unsigned int)                            @Ozone (its own class port)
//   ___dynamic_cast                                           libc++abi
//   OZChannel::getValueAsDouble(CMTime const&, double)        @Ozone 0x6dfa9e (imported stub)
// ────────────────────────────────────────────────────────────────────────────────────────

/** Default field-of-view when no active camera is set. Recovered from @0x706F10.
 *  IEEE-754 double bit pattern 0x4056800000000000 = 90.0 (degrees; the API contract is
 *  degrees per LiSimpleCamera's angleOfView convention). */
export const DEFAULT_ANGLE_OF_VIEW: number = 90.0;

/** OZCamera fixed-offset of the AngleOfView OZChannel subobject. @0x448b5c: `add $0x1A90, %rax`. */
export const OZCAMERA_ANGLE_OF_VIEW_CHANNEL_OFFSET: number = 0x1A90;

/** Frontier interface — matches OZScene's C++ surface needed by getAngleOfView.
 *  Every method here maps 1:1 to a stub-callee cited above. */
export interface OZ360SceneLike {
  /** OZScene::getCurrentTime() -> CMTime */
  getCurrentTime(): CMTime;
  /** OZScene::getActiveCamera(CMTime const&) -> node-id (u32) */
  getActiveCamera(t: CMTime): number;
  /** OZScene::getNode(u32) -> node ptr (or null). If cast-fails, return null. */
  getNodeAsCamera(nodeId: number): OZ360CameraNode | null;
}

/** The subset of an OZCamera node consumed by OZ360Camera. The +0x1A90 OZChannel is
 *  accessed as the "angleOfView" channel — its getValueAsDouble is the real call. */
export interface OZ360CameraNode {
  /** OZChannel::getValueAsDouble(CMTime const&, double defaultValue) @Ozone 0x6dfa9e stub.
   *  Reads the channel value at the given time; returns `defaultValue` if not set. */
  angleOfViewGetValueAsDouble(t: CMTime, defaultValue: number): number;
}

export function getAngleOfView(
  state: OZ360CameraState,
  sceneApi: OZ360SceneLike | null,
): number {
  if (state.scene === null || sceneApi === null) {
    // No scene wired -> fall through to the default (matches the disasm's "je 0x448b78"
    // paths which take the default whenever the active-camera dyn-cast chain fails).
    return DEFAULT_ANGLE_OF_VIEW;                                  // @0x448b78 movsd 90.0
  }
  const t = sceneApi.getCurrentTime();                             // @0x448b07
  const camId = sceneApi.getActiveCamera(t);                       // @0x448b27
  const cam = sceneApi.getNodeAsCamera(camId);                     // @0x448b35 + dyn_cast @0x448b52
  if (cam === null) return DEFAULT_ANGLE_OF_VIEW;                  // @0x448b78 fallback
  // The disasm loads &t (leaq -0x20(%rbp)) and xorps xmm0 (=0.0) then calls into the
  // OZChannel at +0x1A90. Second arg 0.0 is the "no value at this time" fallback.
  return cam.angleOfViewGetValueAsDouble(t, 0.0);                  // @0x448b6c
}

// ────────────────────────────────────────────────────────────────────────────────────────
// Throw-stubs — the four large decode-heavy methods and the ctor/dtors. Each stub cites
// the address of the function it stands in for so frontier.py sees the un-decoded gap.
// ────────────────────────────────────────────────────────────────────────────────────────

/** OZ360Camera::OZ360Camera(OZScene*)  @Ozone 0x448440 (C1) / @0x4484b0 (C2). See header
 *  comment for the 37-line decode; requires LiSimpleCamera + PCShared_base ports. */
export function OZ360Camera_C2(): void {
  throw new Error(
    "OZ360Camera::OZ360Camera(OZScene*) @Ozone 0x4484b0 not yet transcribed — " +
      "requires LiSimpleCamera::LiSimpleCamera(), PCShared_base ctor, and setCameraModel(0) ports.",
  );
}

/** OZ360Camera::~OZ360Camera()  @Ozone 0x448c90 (D2 base dtor). */
export function OZ360Camera_D2(): void {
  throw new Error(
    "OZ360Camera::~OZ360Camera() @Ozone 0x448c90 not yet transcribed — " +
      "requires LiSimpleCamera::~LiSimpleCamera() and PCShared_base::~PCShared_base() ports.",
  );
}

/** OZ360Camera::~OZ360Camera()  @Ozone 0x448ce0 (D1 complete dtor). */
export function OZ360Camera_D1(): void {
  throw new Error(
    "OZ360Camera::~OZ360Camera() @Ozone 0x448ce0 not yet transcribed.",
  );
}

/** OZ360Camera::getTranslation(PCVector3<double>*) const  @Ozone 0x448560.
 *  Walks scene->getActiveCamera(currentTime)->getNode()->dynamic_cast<OZCamera>->{PCVector3
 *  channels at +0x??? offset} via a chained PCSharedCount alloc+*0x110-vtable call chain.
 *  110-line body; needs full OZCamera/PCVector3/PCSharedCount ports. */
export function getTranslation(
  _state: OZ360CameraState,
  _out: PCVector3D,
): void {
  throw new Error(
    "OZ360Camera::getTranslation(PCVector3<double>*) @Ozone 0x448560 not yet transcribed — " +
      "requires OZCamera translation-channel walk via *0x110 vtable dispatch and PCSharedCount alloc chain.",
  );
}

/** OZ360Camera::getRotation(PCQuat<double>*) const  @Ozone 0x448780.
 *  99-line body — same shape as getTranslation but returns a quaternion. */
export function getRotation(
  _state: OZ360CameraState,
  _out: PCQuatD,
): void {
  throw new Error(
    "OZ360Camera::getRotation(PCQuat<double>*) @Ozone 0x448780 not yet transcribed — " +
      "requires OZCamera rotation-channel walk via *0x110 vtable dispatch and PCQuat conversion.",
  );
}

/** OZ360Camera::setRotation(PCQuat<double> const&)  @Ozone 0x448930. */
export function setRotation(
  _state: OZ360CameraState,
  _q: PCQuatD,
): void {
  throw new Error(
    "OZ360Camera::setRotation(PCQuat<double> const&) @Ozone 0x448930 not yet transcribed.",
  );
}

/** OZ360Camera::getActiveCamera(CMTime) const  @Ozone 0x448720. */
export function getActiveCamera(
  _state: OZ360CameraState,
  _t: CMTime,
): number {
  throw new Error(
    "OZ360Camera::getActiveCamera(CMTime) @Ozone 0x448720 not yet transcribed.",
  );
}

/** OZ360Camera::setScene(OZScene*)  @Ozone 0x448bc0. */
export function setScene(
  _state: OZ360CameraState,
  _scene: OZSceneLike | null,
): void {
  throw new Error(
    "OZ360Camera::setScene(OZScene*) @Ozone 0x448bc0 not yet transcribed.",
  );
}
