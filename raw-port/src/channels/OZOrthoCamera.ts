// OZOrthoCamera.ts — Ozone's orthographic camera channel-node.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//     Versions/A/Ozone.
//
// Source disassembly (this worktree):
//   raw-port/re/disasm/OZOrthoCamera.OZOrthoCamera.s   @0x3ad70  (ctor C1)
//   raw-port/re/disasm/OZOrthoCamera.~OZOrthoCamera.s  @0x408e0  (dtor D0)
//     (dtor D1 lives at @0x40890 — same body class, complete-object flavour)
//   raw-port/re/disasm/OZOrthoCamera.resetRotation.s   @0x40940
//   raw-port/re/disasm/OZOrthoCamera.reset.s           @0x40a80
//   raw-port/re/disasm/OZOrthoCamera.isModified.s      @0x40af0
//
// nm -arch x86_64 (relevant symbols):
//   000000000003ad70 T __ZN13OZOrthoCameraC1EiRK9PCVector2IdE
//   0000000000040890 T __ZN13OZOrthoCameraD1Ev
//   00000000000408e0 T __ZN13OZOrthoCameraD0Ev
//   0000000000040940 T __ZN13OZOrthoCamera13resetRotationEv
//   0000000000040a80 T __ZN13OZOrthoCamera5resetEv
//   0000000000040af0 T __ZN13OZOrthoCamera10isModifiedEv
//   00000000008315d8 S vtable for OZOrthoCamera  (installed-ptr 0x8315e8)
//
// CLASS ROLE: OZOrthoCamera is a concrete LiSimpleCamera subclass that
// represents one of six axis-aligned orthographic camera views (front,
// back, left, right, top, bottom). It stores its own POD state — a
// quaternion (w,x,y,z) at +0x208..+0x220, an int `cameraType` at +0x228,
// and a filmback Vector2<double> at +0x230..+0x240 — on top of the
// LiSimpleCamera / LiCamera / LiBaseCamera / PCShared inheritance
// chain. `cameraType` selects which orthographic quaternion `reset()`
// installs via `resetRotation()`. `isModified()` compares the current
// rotation+translation against the identity to decide whether the
// user has manually reoriented the camera.
//
// OBJECT LAYOUT (from ctor + resetRotation + isModified):
//   +0x000..+0x1FF: LiSimpleCamera base (see raw-port/src/channels/
//                   LiCamera.ts; the vtable lives outside this framework
//                   and is imported via chained-fixups).
//   +0x200..+0x207: LiSimpleCamera tail (unread by this class).
//   +0x208: double  rotation.w   — quaternion scalar
//   +0x210: double  rotation.x
//   +0x218: double  rotation.y
//   +0x220: double  rotation.z
//   +0x228: int32   cameraType   — selects the axis view (see enum below)
//   +0x230: double  filmback.x   — PCVector2<double> width
//   +0x238: double  filmback.y   — PCVector2<double> height
//   +0x240..+0x24F: PCShared_base subobject (secondary base at offset
//                   +0x240 — installed by ctor @0x3ad84).
//
// CAMERA TYPE ENUM — recovered by decoding the `resetRotation` jump
// table @0x40a5c (6 4-byte offsets, base=0x40a5c) together with the
// double/xmmword constants each case installs:
//
//   value  quaternion (w, x, y, z)                    orientation
//   -----  -----------------------------------------  --------------
//     2    ( +√2/2,  0,       -√2/2,   0        )     RIGHT  (90° −Y)
//     3    ( +√2/2,  0,       +√2/2,   0        )     LEFT   (90° +Y)
//     4    ( +√2/2, -√2/2,     0,      0        )     TOP    (90° −X)
//     5    ( +√2/2, +√2/2,     0,      0        )     BOTTOM (90° +X)
//     6    (  1,     0,        0,      0        )     FRONT  (identity)
//     7    ( ~0,     0,       +1,      0        )     BACK   (180° Y)
//
//     √2/2  = 0.7071067811865476 (bit pattern 0x3fe6a09e667f3bcd — d0)
//    −√2/2  = -0.7071067811865475 (bit pattern 0xbfe6a09e667f3bcc — d1)
//     ~0    = 6.123233995736766e-17 (bit pattern 0x3c91a626_3314_5c07 —
//             the truncated cos(π/2) that Ozone stores at 0x706f30.d0).
//
// The RIP-relative pool offsets used by resetRotation:
//   0x706f48 → double  d0 = -0.7071067811865475          (case 2 load)
//   0x706e80 → xmmword d0 = +0.7071..., d1 = -0.7071...  (case 4 load)
//   0x706e70 → xmmword d0 = +0.7071..., d1 = +0.7071...  (case 5 load)
//   0x706f38 → double  d0 = +0.7071...                    (case 3 load)
//   0x706f40 → double  d0 = +0.7071...                    (cases 2,3)
//   0x7053e0 → double  d0 = 1.0                           (case 7 y-lo)
//   0x706f30 → double  d0 =  6.123e-17 ≈ cos(π/2)         (case 7 w)
// All computed as `RIPend + disp32`; verified by seeking the FAT
// x86_64 slice at file-offset 0x4000 + VA.
//
// EXTERNAL CALLEES (all resolved as symbol-stubs in the __stubs section
// — cited by demangled name and the mangled __Zxxx symbol nm reports):
//   @0x3adaf callq __ZN14LiSimpleCameraC2Ev         (LiSimpleCamera::LiSimpleCamera())
//   @0x3ae0f callq __ZN14LiSimpleCamera14setCameraModelE13LiCameraModel
//                                                    (LiSimpleCamera::setCameraModel(1))
//   @0x3ae64 callq __ZN13PCShared_baseD2Ev          (base dtor D2)
//   @0x3ae6c callq __Unwind_Resume                  (EH landing pad)
//   @0x40917 callq __ZN18PC_Sp_counted_base12weak_releaseEv
//                                                    (weak_release; only if
//                                                     the shared-ptr slot
//                                                     +0x248 was non-null)
//   @0x40925 jmp   __ZdlPv                          (operator delete)
//   @0x40a36 callq _PCPrint                         (unreachable-case abort
//                                                     header — args =
//                                                     File %s line %d
//                                                     "cameraType")
//   @0x40a3b callq _pcAbortImpl                     (immediate abort)
//   @0x408f4 callq __ZN14LiSimpleCameraD2Ev         (parent D2 destructor)
//
// VTABLE SLOTS (imported from LiSimpleCamera in another framework — the
// installed-ptr 0x8315e8 shows the OZOrthoCamera slots at +0x3a8/+0x3b0
// /+0x3b8, but +0x110..+0x2E0 are chained-fixup indices into another
// framework's exports. I cite them by numeric byte-offset so the
// eventual LiSimpleCamera port can fill them in):
//   *0x110  used by isModified — returns a 16-byte PCVector2<double>
//           into an sret buffer given by rdi (called with rsi=this).
//           This matches LiSimpleCamera::getFilmback() — sret pattern
//           for a POD return larger than 8 bytes.
//   *0x120  used by ctor + reset — takes an in-param rsi=&PCVector2<double>
//           and mutates the camera. This matches
//           __ZN14LiSimpleCamera11setFilmbackERK9PCVector2IdE
//           (LiSimpleCamera::setFilmback).
//   *0x1B8  used by isModified — writes a 16-byte value into rsi's buffer;
//           read-side pair of *0x110. Matches getTranslation() (returns
//           PCVector3<double> — 24 bytes — but the caller reserved only
//           16, so this is likely a smaller "look-at" 2D-ish query; I
//           preserve the exact ABI without over-interpreting).
//   *0x1C0  used by reset — takes rsi=&{x=0,y=0,z=0} (24-byte zero on
//           stack). Matches __ZN14LiSimpleCamera14setTranslationERK9PCVector3IdE.
//   *0x1D8  used by isModified — writes a double into rsi. Matches a
//           parent getter for a scalar (compared against 1.0 immediately
//           after — likely getZoom / getScale).
//   *0x1E0  tail-called by resetRotation with rsi=&this->rotation (i.e.
//           &this[0x208], the quaternion). Matches
//           __ZN14LiSimpleCamera11setRotationERK6PCQuatIdE.
//   *0x200  called by ctor + reset with xmm0=0. Matches a scalar setter
//           (setAperture / setAngleOfView / setZoom = 0.0).
//   *0x280  called by reset with esi=1. Matches setCameraModel(1) —
//           `LiCameraModel` enum value 1 == orthographic. Note the ctor
//           uses the direct symbol-stub @0x3ae0f (before the vtable is
//           installed for OZOrthoCamera); reset uses the virtual slot
//           (after full construction). Both point to the same
//           LiSimpleCamera::setCameraModel.
//   *0x3A0  called by ctor + reset AFTER setFilmback with no arg.
//           Sits one slot BEFORE resetRotation (*0x3A8) in the vtable
//           — likely `LiSimpleCamera::resetTranslation()` (the twin of
//           our resetRotation that lives on the parent).
//
// SHARED-PTR TAIL: +0x240 is a PCShared_base subobject: the ctor
// installs `vtable for PCShared_base + 0x10` at +0x240 and zeroes the
// weak-counted-base pointer at +0x248. D0 mirrors that: parent D2 →
// re-install PCShared_base vtable at +0x240 → weak_release if +0x248
// non-null → operator delete on this pointer.
//
// -----------------------------------------------------------------------

// PCVector2<double> — 16-byte POD used for filmback size (width, height).
// The ctor reads two consecutive doubles via `movups (%r15), %xmm0` and
// writes them via `movups %xmm0, 0x230(%rbx)` — i.e. it treats it as an
// opaque 16-byte value with no per-field access. We mirror that by
// storing a two-double pair.
export interface PCVector2d {
  x: number; // double
  y: number; // double
}

// PCVector3<double> — 24-byte POD. Only appears in `reset` where it is
// zero-initialised on the stack and passed by reference to vtable slot
// *0x1C0 (setTranslation).
export interface PCVector3d {
  x: number; // double
  y: number; // double
  z: number; // double
}

// PCQuat<double> — 32-byte POD stored inline in the object at +0x208
// as four consecutive doubles: (w, x, y, z). Ozone lays it out with
// the scalar component FIRST — this is derived from the ctor: it
// writes 1.0 to +0x208 (identity's w) and zeros +0x210..+0x220.
export interface PCQuatd {
  w: number; // double  @+0x208
  x: number; // double  @+0x210
  y: number; // double  @+0x218
  z: number; // double  @+0x220
}

// LiCameraModel enum (from __ZN14LiSimpleCamera14setCameraModelE13LiCameraModel).
// Only value 1 is used by OZOrthoCamera; documented for clarity.
export const enum LiCameraModel {
  Perspective = 0,   // inferred by exclusion — not exercised here
  Orthographic = 1,  // used by ctor @0x3ae0f and reset @0x40a8f
}

// The six orthographic camera types, as decoded from the resetRotation
// jump table @0x40a5c. Values outside 2..7 hit the unreachable-abort
// branch @0x40a14 which calls `PCPrint("File %s, line %d …") + pcAbortImpl`.
export const enum OZOrthoCameraType {
  Right  = 2,  // 90° about −Y  → quaternion ( √2/2,  0, −√2/2,  0)
  Left   = 3,  // 90° about +Y  → quaternion ( √2/2,  0, +√2/2,  0)
  Top    = 4,  // 90° about −X  → quaternion ( √2/2, −√2/2,  0,  0)
  Bottom = 5,  // 90° about +X  → quaternion ( √2/2, +√2/2,  0,  0)
  Front  = 6,  // identity      → quaternion (  1,    0,    0,   0)
  Back   = 7,  // 180° about  Y → quaternion (  ~0,   0,   +1,   0)
}

// Bit-exact constants recovered from the Ozone __TEXT/__const pool.
// √2/2 has TWO representations in the binary — the "positive" @0x706e70
// stores 0x3fe6a09e667f3bcd (d0), and the "negative-adjacent" @0x706e80/
// 0x706f40 store 0x3fe6a09e667f3bcd next to 0xbfe6a09e667f3bcc. These
// are the standard IEEE-754 bit-patterns for +sin(π/4) and −sin(π/4)
// (which differ from +cos(π/4) only in the last ULP). We reproduce them
// EXACTLY — do NOT substitute Math.SQRT1_2 (which is 0x3fe6a09e667f3bcd
// and matches the +d0 value but not the −d1 value).
const SQRT2_2_POS = 0.7071067811865476;   // 0x3fe6a09e667f3bcd @0x706e70.d0
const SQRT2_2_NEG = -0.7071067811865475;  // 0xbfe6a09e667f3bcc @0x706f48.d0
// cos(π/2) rounded to double — bit pattern 0x3c91a62633145c07. Stored
// verbatim at 0x706f30.d0 and used ONLY by case 7 (back view). Ozone
// keeps the small non-zero residue rather than clamping to 0.
const COS_PI_2   = 6.123233995736766e-17; // 0x3c91a62633145c07 @0x706f30.d0

// -----------------------------------------------------------------------
// The class itself.
//
// OZOrthoCamera "extends" LiSimpleCamera. We do not have an LiSimpleCamera
// port yet (its vtable is imported from another framework), so we model
// its subobject as an opaque bag plus the setter/getter surface exercised
// here. Every virtual dispatch through the parent vtable is expressed as
// a `protected` method with @vtable-slot citation — the day LiSimpleCamera
// lands, they get wired to real implementations.
// -----------------------------------------------------------------------

export class OZOrthoCamera {
  // -------- OZOrthoCamera's OWN fields (+0x208..+0x240) --------
  // Names match the semantic decoding above; layout mirrors the object.

  /** Quaternion rotation @+0x208 (w, x, y, z as four doubles). */
  public rotation: PCQuatd = { w: 1.0, x: 0.0, y: 0.0, z: 0.0 };

  /** int32 camera-type selector @+0x228. Constructor takes it as the
   *  first arg (`int`) and stores it here (@0x3adf5 `movl %r12d, 0x228`).
   *  Values outside 2..7 make resetRotation abort. */
  public cameraType: number = 0;

  /** PCVector2<double> filmback @+0x230..+0x240. Constructor copies
   *  16 bytes via `movups` from the reference argument. */
  public filmback: PCVector2d = { x: 0.0, y: 0.0 };

  // -------- PCShared_base subobject (@+0x240..+0x24F) --------
  // The ctor installs vtable-for-PCShared_base+0x10 at +0x240 and zeroes
  // the weak-counted-base ptr at +0x248 (@0x3ad8f, @0x3ad96). We don't
  // yet have a PCShared_base port so we model the observable pieces:
  // the weak-counted-base pointer that D0 reads to decide whether to
  // call weak_release. In a full port this would be a PCShared_base
  // instance held by composition; for now, keep it as a nullable slot.
  protected _sharedWeakCountedBase: object | null = null; // +0x248

  // ------------------------------------------------------------------
  // Constructor  @0x3ad70   __ZN13OZOrthoCameraC1EiRK9PCVector2IdE
  //
  //   OZOrthoCamera(int cameraType, PCVector2<double> const& filmback);
  //
  // Faithful control flow:
  //   @0x3ad84  install PCShared_base subobject vtable at +0x240
  //   @0x3ad96  zero the weak-counted-base pointer at +0x248
  //   @0x3adaf  callq LiSimpleCamera::LiSimpleCamera()   [parent C2]
  //   @0x3adb4  install OZOrthoCamera's own vtable at +0x000
  //             AND set +0x240 to (OZOrthoCamera vtable + 0x3F0)
  //             — the second-base thunk table entry.
  //   @0x3adcf  write 1.0 to +0x208 (quaternion.w)
  //   @0x3ade0  zero +0x210..+0x21F (quaternion.x, .y)
  //   @0x3adea  zero +0x220 (quaternion.z)
  //   @0x3adf5  store cameraType at +0x228
  //   @0x3adfc  copy 16 bytes from *filmback into +0x230..+0x240
  //   @0x3ae0f  callq LiSimpleCamera::setCameraModel(1)  ; orthographic
  //   @0x3ae1d  call  vtable *0x200 with xmm0=0.0        ; setAperture-like
  //   @0x3ae2c  call  vtable *0x120 with rsi=&filmback   ; setFilmback
  //   @0x3ae38  call  vtable *0x3A0 with no arg          ; resetTranslation-like
  //   return.
  //
  // The tail @0x3ae47..0x3ae71 is an exception cleanup landing pad
  // reached if LiSimpleCamera's C2 or any post-C2 setter throws:
  //   - restore the PCShared_base subobject (@0x3ae5a addq $0x240,%rbx)
  //   - call PCShared_base::~PCShared_base
  //   - re-raise via _Unwind_Resume.
  // TypeScript has no direct analogue; we assign fields in order and
  // let normal exceptions propagate.
  // ------------------------------------------------------------------
  constructor(cameraType: number, filmback: Readonly<PCVector2d>) {
    // @0x3ad84..@0x3ad96: PCShared_base subobject init.
    this._sharedWeakCountedBase = null;

    // @0x3adaf: LiSimpleCamera::LiSimpleCamera() — parent C2 constructor.
    // Not yet ported; the invocation is preserved by delegation.
    this._liSimpleCameraCtor();

    // @0x3adcf..@0x3adea: quaternion defaulted to identity (w=1, x=y=z=0).
    // Note this is the DEFAULT — resetRotation() will overwrite it based
    // on cameraType if reset() is invoked later. The ctor deliberately
    // does NOT call resetRotation (the C++ author would have relied on
    // the caller to call reset() to install the correct axis rotation).
    this.rotation = { w: 1.0, x: 0.0, y: 0.0, z: 0.0 };

    // @0x3adf5: store the int cameraType.
    this.cameraType = cameraType | 0;

    // @0x3adfc..@0x3ae00: 16-byte copy of filmback.
    this.filmback = { x: filmback.x, y: filmback.y };

    // @0x3ae0f: LiSimpleCamera::setCameraModel(Orthographic).
    this._liSimpleCameraSetCameraModel(LiCameraModel.Orthographic);

    // @0x3ae1d: parent vtable *0x200 with xmm0 = 0.0. This is a
    // single-double setter on LiSimpleCamera whose slot lands just
    // before the block of camera-model/pose methods — most consistent
    // with setAngleOfView(0.0) or setZoom(0.0). Left as a virtual
    // hook citing the vtable slot.
    this._liSimpleCameraVSlot0x200(0.0);

    // @0x3ae2c: parent vtable *0x120 with rsi = &filmback. This is
    // LiSimpleCamera::setFilmback(PCVector2<double> const&).
    this._liSimpleCameraSetFilmback(this.filmback);

    // @0x3ae38: parent vtable *0x3A0 (no arg). The slot immediately
    // BELOW resetRotation (*0x3A8). Named "resetTranslation-like" in
    // the header — resets the pose translation component.
    this._liSimpleCameraVSlot0x3A0();
  }

  // ------------------------------------------------------------------
  // Destructor  @0x408e0   __ZN13OZOrthoCameraD0Ev
  //   (D1 @0x40890 shares the same body up to the `operator delete`
  //    tail — D1 leaves the storage alone, D0 frees it. In JS/TS
  //    there is no manual delete, so we collapse them to one dispose
  //    method that clears the strong->weak backref if present.)
  //
  // Faithful control flow:
  //   @0x408e9  load &VTT and add 8 -> parent-most sub-vtable ptr
  //   @0x408f4  callq __ZN14LiSimpleCameraD2Ev   ; parent D2
  //   @0x408f9  install PCShared_base vtable at +0x240
  //   @0x4090b  load +0x248 into rdi
  //   @0x40915  je +7  (skip weak_release if null)
  //   @0x40917  callq __ZN18PC_Sp_counted_base12weak_releaseEv
  //   @0x40925  jmp   __ZdlPv                    ; operator delete(this)
  // ------------------------------------------------------------------
  public dispose(): void {
    // @0x408f4: LiSimpleCamera::~LiSimpleCamera (D2).
    this._liSimpleCameraDtor();

    // @0x40915..@0x40917: conditional weak_release on the counted base.
    if (this._sharedWeakCountedBase !== null) {
      this._pcSpCountedBaseWeakRelease(this._sharedWeakCountedBase);
      this._sharedWeakCountedBase = null;
    }
    // @0x40925: jmp __ZdlPv — the operator-delete tail. No-op in TS.
  }

  // ------------------------------------------------------------------
  // resetRotation  @0x40940   __ZN13OZOrthoCamera13resetRotationEv
  //
  // Fault: if cameraType is outside [2..7] the function calls
  // PCPrint("File %s, line %d should not have been reached:\n\t",
  //         "…/Ozone/CompositorObject/OZOrthoCamera.h", 0x46, "cameraType")
  // then pcAbortImpl. We faithfully throw an exception whose message
  // captures the same three facts (file, line 0x46 = 70, tag).
  //
  // Body dispatches on cameraType-2 in a 6-entry jump table @0x40a5c
  // (`leaq 0xfd(%rip),%rcx; movslq (%rcx,%rax,4),%rax; addq %rcx,%rax;
  //  jmpq *%rax`). The six targets install (w, x, y, z) into
  // +0x208..+0x220 as documented in the header table. All six then
  // fall through to @0x40a43 which tail-calls the parent's setRotation
  // via vtable *0x1E0 with rsi = &this->rotation.
  // ------------------------------------------------------------------
  public resetRotation(): void {
    // @0x40946: fetch cameraType, subtract 2, compare > 5 → default.
    const idx = ((this.cameraType | 0) - 2) | 0;

    // @0x4094f `ja 0x40a14`: unsigned-above uses the low bits directly,
    // so idx<0 (i.e. cameraType<2) also falls into the abort.
    if ((idx >>> 0) > 5) {
      // @0x40a14..@0x40a3b: PCPrint + pcAbortImpl unreachable-case abort.
      // Faithful reproduction of the abort tag and location.
      throw new Error(
        // eslint-disable-next-line no-useless-concat
        "File /Library/Caches/com.apple.xbs/Sources/MotionSharedCode/" +
          "Motion-45000.0.157/Ozone/CompositorObject/OZOrthoCamera.h, " +
          "line 70 should not have been reached: cameraType " +
          // raise via a hard error — no fallback path.
          "@0x40a14",
      );
    }

    // Switch dispatch — jump-table targets recovered from
    //   raw-port/re/disasm/OZOrthoCamera.resetRotation.s @0x40a5c.
    switch (idx) {
      case 0: // cameraType == 2  (Right) — target @0x40968
        // @0x40968 movsd -0.7071(%rip),%xmm0  → xmm0.lo = -√2/2, hi = 0
        // @0x40970 jmp 0x409dc
        // @0x409dc movups %xmm0, 0x218(%rdi) → y=-√2/2, z=0
        // @0x409e3 movsd 0x706f40.d0(%rip),%xmm0 → xmm0.lo = +√2/2, hi=0
        // @0x409eb movups %xmm0, 0x208(%rdi) → w=+√2/2, x=0
        this.rotation = { w: SQRT2_2_POS, x: 0.0, y: SQRT2_2_NEG, z: 0.0 };
        break;

      case 1: // cameraType == 3  (Left) — target @0x409d4
        // @0x409d4 movsd 0x706f38.d0(%rip),%xmm0 → +√2/2 (hi=0)
        // @0x409dc movups %xmm0, 0x218(%rdi)  → y=+√2/2, z=0
        // @0x409e3 movsd 0x706f40.d0(%rip),%xmm0 → +√2/2 (hi=0)
        // @0x409eb movups %xmm0, 0x208(%rdi)  → w=+√2/2, x=0
        this.rotation = { w: SQRT2_2_POS, x: 0.0, y: SQRT2_2_POS, z: 0.0 };
        break;

      case 2: // cameraType == 4  (Top) — target @0x4099d
        // @0x4099d xorps %xmm0,%xmm0
        // @0x409a0 movups %xmm0, 0x218(%rdi)  → y=0, z=0
        // @0x409a7 movaps 0x706e80(%rip),%xmm0 → xmmword (+√2/2, -√2/2)
        // @0x409ae movups %xmm0, 0x208(%rdi)  → w=+√2/2, x=-√2/2
        this.rotation = { w: SQRT2_2_POS, x: SQRT2_2_NEG, y: 0.0, z: 0.0 };
        break;

      case 3: // cameraType == 5  (Bottom) — target @0x409ba
        // @0x409ba xorps %xmm0,%xmm0
        // @0x409bd movups %xmm0, 0x218(%rdi)  → y=0, z=0
        // @0x409c4 movaps 0x706e70(%rip),%xmm0 → xmmword (+√2/2, +√2/2)
        // @0x409cb movups %xmm0, 0x208(%rdi)  → w=+√2/2, x=+√2/2
        this.rotation = { w: SQRT2_2_POS, x: SQRT2_2_POS, y: 0.0, z: 0.0 };
        break;

      case 4: // cameraType == 6  (Front) — target @0x40972
        // @0x40972 xorps %xmm0,%xmm0
        // @0x40975 movups %xmm0, 0x210(%rdi)  → x=0, y=0
        // @0x4097c movq $0, 0x220(%rdi)      → z=0
        // @0x40987 movabsq $0x3FF0000000000000, %rax
        // @0x40991 movq %rax, 0x208(%rdi)    → w=1.0
        this.rotation = { w: 1.0, x: 0.0, y: 0.0, z: 0.0 };
        break;

      case 5: // cameraType == 7  (Back) — target @0x409f4
        // @0x409f4 movsd 0x7053e0.d0(%rip),%xmm0 → 1.0 (hi=0)
        // @0x409fc movups %xmm0, 0x218(%rdi)  → y=1.0, z=0
        // @0x40a03 movsd 0x706f30.d0(%rip),%xmm0 → 6.123e-17 (hi=0)
        // @0x40a0b movups %xmm0, 0x208(%rdi)  → w=~0, x=0
        this.rotation = { w: COS_PI_2, x: 0.0, y: 1.0, z: 0.0 };
        break;

      default:
        // Unreachable — the (idx>>>0)>5 guard above already handled
        // the abort path. Retained to make the switch total.
        throw new Error("OZOrthoCamera.resetRotation: unreachable @0x40a14");
    }

    // @0x40a43: tail-call parent's setRotation(quat const&) via
    // vtable *0x1E0. The address passed is &this->rotation (i.e.
    // &this[+0x208] — the four doubles we just wrote).
    this._liSimpleCameraSetRotation(this.rotation);
  }

  // ------------------------------------------------------------------
  // reset  @0x40a80   __ZN13OZOrthoCamera5resetEv
  //
  //   @0x40a8f  call vtable *0x280 with esi=1        ; setCameraModel(1)
  //   @0x40aa3  call vtable *0x200 with xmm0=0.0     ; setAperture-like
  //   @0x40aaf  call vtable *0x3A0 (no arg)          ; resetTranslation-like
  //   @0x40ab5  zero 24 bytes on stack -0x20..-0x08  ; PCVector3<double>{0}
  //   @0x40ace  call vtable *0x1C0 with rsi=&{0,0,0} ; setTranslation({0,0,0})
  //                                                  ;   — redundant with
  //                                                  ;   the *0x3A0 above;
  //                                                  ;   the C++ author
  //                                                  ;   likely reset both
  //                                                  ;   translation and
  //                                                  ;   whatever *0x3A0
  //                                                  ;   handles.
  //   @0x40ae1  call vtable *0x120 with rsi=&filmback ; setFilmback(this.filmback)
  //   return.
  //
  // NOTE: reset does NOT call resetRotation on this. If callers want
  // orientation restored they must invoke resetRotation() separately.
  // This matches the C++ vtable semantics — reset() and resetRotation()
  // are independent slots (*0x3B0 and *0x3A8).
  // ------------------------------------------------------------------
  public reset(): void {
    // @0x40a8f: setCameraModel(1) via vtable *0x280.
    this._liSimpleCameraSetCameraModelVirtual(LiCameraModel.Orthographic);

    // @0x40aa3: parent vtable *0x200 with xmm0 = 0.0.
    this._liSimpleCameraVSlot0x200(0.0);

    // @0x40aaf: parent vtable *0x3A0 (no arg) — "resetTranslation-like".
    this._liSimpleCameraVSlot0x3A0();

    // @0x40ab5..@0x40ace: setTranslation({0,0,0}) via vtable *0x1C0.
    const zeroT: PCVector3d = { x: 0.0, y: 0.0, z: 0.0 };
    this._liSimpleCameraSetTranslation(zeroT);

    // @0x40ae1: setFilmback(this.filmback) via vtable *0x120.
    this._liSimpleCameraSetFilmback(this.filmback);
  }

  // ------------------------------------------------------------------
  // isModified  @0x40af0   __ZN13OZOrthoCamera10isModifiedEv
  //
  // Layout of the stack frame (all doubles):
  //   -0x28 .. -0x21  identityQuat.w   (initialised to 1.0)
  //   -0x20 .. -0x19  identityQuat.x   (0)
  //   -0x18 .. -0x11  identityQuat.y   (0)
  //   -0x10 .. -0x09  identityQuat.z   (0)
  //   -0x40 .. -0x39  translationTmp.x (0)
  //   -0x38 .. -0x31  translationTmp.y (0)
  //   -0x30 .. -0x29  translationTmp.z (unused — see below)
  //   -0x50 .. -0x49  filmbackTmp.x    (written by *0x110)
  //   -0x48 .. -0x41  filmbackTmp.y    (written by *0x110)
  //
  // Faithful control flow:
  //   @0x40afc-@0x40b19  build identityQuat = {1,0,0,0} on the stack
  //   @0x40b28  call vtable *0x1D8 with rsi=&identityQuat (writes a
  //             double INTO that slot — Ozone repurposes the local as
  //             a scratch pad). This actually OVERWRITES identityQuat.w
  //             with the "queried" scalar. Yes — really: the disasm
  //             passes -0x28(%rbp) as rsi and slot *0x1D8 is a
  //             "get-a-double" query.
  //   @0x40b3c  call vtable *0x1B8 with rsi=&translationTmp — writes
  //             16 bytes of "translation" state.
  //   @0x40b4c  call vtable *0x110 with rdi=&filmbackTmp, rsi=this
  //             — sret-style getFilmback returning PCVector2<double>.
  //   @0x40b52  ucomisd this->rotation.w (+0x208) vs -0x28(%rbp)
  //             (the just-overwritten scalar); early-return al=1 if
  //             they differ (jne 0x40b65 with al already set to 1).
  //   @0x40b6c  ucomisd this->rotation.x (+0x210) vs -0x20(%rbp)
  //             — the identityQuat.x slot which is still 0.0.
  //   @0x40b7d  ucomisd this->rotation.y (+0x218) vs -0x18(%rbp) — 0.0.
  //   @0x40b8e..@0x40b93  cmpneqsd this->rotation.z (+0x220) vs
  //                       -0x10(%rbp) — 0.0. movq to rax; and $1.
  //   @0x40ba1  return  eax & 1.
  //
  // Semantics: return true iff the current rotation is NOT
  //   ( vtable_get(*0x1D8),  0,  0,  0 ).
  //
  // The *0x1D8 slot is queried through a scratch buffer initialised to
  // 1.0 — so if *0x1D8 is a no-op (leaves buffer untouched), the
  // comparison degenerates to "is rotation.w != 1.0". This is the
  // classic pattern: "consider the camera modified iff its rotation
  // is not the identity quaternion (1, 0, 0, 0)".
  //
  // The filmbackTmp and translationTmp writes ARE observed (both
  // vtable slots receive `rsi`) but their return values are unused
  // by isModified — they are pure side-effect calls, likely to
  // materialise/cache state in the camera before the rotation
  // comparison. We preserve those calls.
  // ------------------------------------------------------------------
  public isModified(): boolean {
    // @0x40afc..@0x40b19: local `q` = identity quaternion.
    const q: PCQuatd = { w: 1.0, x: 0.0, y: 0.0, z: 0.0 };

    // @0x40b25..@0x40b2c: vtable *0x1D8 — a scalar getter that writes
    // its result into `rsi` (a pointer to a double, positioned at
    // &q.w in the stack frame). We faithfully model this as a
    // scratchpad write.
    const scratchW = { value: q.w };
    this._liSimpleCameraVSlot0x1D8(scratchW);
    q.w = scratchW.value;

    // @0x40b32..@0x40b3c: vtable *0x1B8 — a 16-byte writer into a
    // stack local `translationTmp`. We keep the call for side-effects
    // parity; the result is not consumed.
    const translationTmp: PCVector2d = { x: 0.0, y: 0.0 };
    this._liSimpleCameraVSlot0x1B8(translationTmp);

    // @0x40b42..@0x40b4c: vtable *0x110 — sret getFilmback into a
    // stack local. Return value unused; retained for side-effect parity.
    const filmbackTmp: PCVector2d = { x: 0.0, y: 0.0 };
    this._liSimpleCameraGetFilmback(filmbackTmp);

    // @0x40b52..@0x40baa: rotation != q comparison, treating each
    // slot as a bit-exact double. ucomisd sets ZF on unordered/equal;
    // "jne/jp" together mean "any NaN or any inequality" is a hit.
    // We mirror that with strict !==, which for finite doubles agrees
    // (NaN vs anything is unequal by both). Note: because rotation is
    // written by resetRotation() from bit-exact constants, no NaN
    // path is reachable here in practice.
    if (this.rotation.w !== q.w) return true;
    if (this.rotation.x !== q.x) return true;
    if (this.rotation.y !== q.y) return true;
    // @0x40b93 cmpneqsd + and $1 → boolean of (rotation.z != 0.0).
    return this.rotation.z !== q.z;
  }

  // ==================================================================
  // Parent (LiSimpleCamera) surface — throwing stubs citing the parent
  // symbols/vtable slots they represent. When LiSimpleCamera is ported
  // these become concrete overrides.
  // ==================================================================

  /** LiSimpleCamera::LiSimpleCamera() — @0x3adaf call target
   *  __ZN14LiSimpleCameraC2Ev. Not yet ported. */
  protected _liSimpleCameraCtor(): void {
    // Deliberately no-op at this layer: the parent's construction is
    // observable only via subsequent virtual dispatches, which we
    // route through the `_liSimpleCameraV*` hooks. Full port pending. @0x3adaf
  }

  /** LiSimpleCamera::~LiSimpleCamera D2 — @0x408f4 call target
   *  __ZN14LiSimpleCameraD2Ev. Not yet ported. */
  protected _liSimpleCameraDtor(): void {
    // No-op mirror of the D2 body. @0x408f4
  }

  /** LiSimpleCamera::setCameraModel(LiCameraModel) — direct symbol call
   *  @0x3ae0f: __ZN14LiSimpleCamera14setCameraModelE13LiCameraModel. */
  protected _liSimpleCameraSetCameraModel(_model: LiCameraModel): void {
    // Not yet ported; raise so callers see the frontier. @0x3ae0f
    throw new Error(
      "OZOrthoCamera: LiSimpleCamera::setCameraModel not yet transcribed @0x3ae0f",
    );
  }

  /** Virtual dispatch of setCameraModel via *0x280 — @0x40a94 in reset().
   *  Resolves to the same LiSimpleCamera::setCameraModel body after full
   *  construction. */
  protected _liSimpleCameraSetCameraModelVirtual(model: LiCameraModel): void {
    // Delegate to the direct implementation — same body, different
    // dispatch site. @0x40a94
    this._liSimpleCameraSetCameraModel(model);
  }

  /** vtable *0x120 — LiSimpleCamera::setFilmback(PCVector2<double> const&).
   *  Called at @0x3ae2c (ctor) and @0x40ae1 (reset). */
  protected _liSimpleCameraSetFilmback(_filmback: Readonly<PCVector2d>): void {
    // Not yet ported; raise for demand signal. @0x3ae2c @0x40ae1
    throw new Error(
      "OZOrthoCamera: LiSimpleCamera::setFilmback not yet transcribed @0x3ae2c",
    );
  }

  /** vtable *0x1E0 — LiSimpleCamera::setRotation(PCQuat<double> const&).
   *  Tail-called at @0x40a58 from resetRotation. */
  protected _liSimpleCameraSetRotation(_q: Readonly<PCQuatd>): void {
    // Not yet ported; raise for demand signal. @0x40a58
    throw new Error(
      "OZOrthoCamera: LiSimpleCamera::setRotation not yet transcribed @0x40a58",
    );
  }

  /** vtable *0x1C0 — LiSimpleCamera::setTranslation(PCVector3<double> const&).
   *  Called at @0x40ace from reset(). */
  protected _liSimpleCameraSetTranslation(_t: Readonly<PCVector3d>): void {
    // Not yet ported; raise for demand signal. @0x40ace
    throw new Error(
      "OZOrthoCamera: LiSimpleCamera::setTranslation not yet transcribed @0x40ace",
    );
  }

  /** vtable *0x110 — LiSimpleCamera::getFilmback(sret PCVector2<double>).
   *  Called at @0x40b4c from isModified(). */
  protected _liSimpleCameraGetFilmback(_out: PCVector2d): void {
    // Not yet ported; raise for demand signal. @0x40b4c
    throw new Error(
      "OZOrthoCamera: LiSimpleCamera::getFilmback not yet transcribed @0x40b4c",
    );
  }

  /** vtable *0x200 — anonymous scalar setter on LiSimpleCamera called
   *  by ctor @0x3ae1d and reset @0x40aa3, both with xmm0 = 0.0.
   *  Landing site in the vtable suggests setAperture / setZoom /
   *  setAngleOfView; leave unresolved until LiSimpleCamera lands. */
  protected _liSimpleCameraVSlot0x200(_v: number): void {
    // Not yet ported. @0x3ae1d @0x40aa3
    throw new Error(
      "OZOrthoCamera: LiSimpleCamera vtable slot *0x200 not yet transcribed @0x3ae1d",
    );
  }

  /** vtable *0x3A0 — anonymous no-arg method on LiSimpleCamera called
   *  by ctor @0x3ae38 and reset @0x40aaf. Adjacent to resetRotation
   *  in the vtable — likely resetTranslation. */
  protected _liSimpleCameraVSlot0x3A0(): void {
    // Not yet ported. @0x3ae38 @0x40aaf
    throw new Error(
      "OZOrthoCamera: LiSimpleCamera vtable slot *0x3A0 not yet transcribed @0x3ae38",
    );
  }

  /** vtable *0x1D8 — scalar-getter that writes a double into `*rsi`.
   *  Called by isModified @0x40b2c against a scratch slot pre-loaded
   *  with 1.0. See isModified() header for the full protocol. */
  protected _liSimpleCameraVSlot0x1D8(_out: { value: number }): void {
    // Not yet ported. Leaves `_out.value` untouched (mirrors the
    // "scalar left as 1.0" hypothesis stated in isModified's header)
    // — raise instead so the frontier is visible. @0x40b2c
    throw new Error(
      "OZOrthoCamera: LiSimpleCamera vtable slot *0x1D8 not yet transcribed @0x40b2c",
    );
  }

  /** vtable *0x1B8 — 16-byte writer into `*rsi`. Called by isModified
   *  @0x40b3c with a PCVector2<double>-shaped scratch buffer. */
  protected _liSimpleCameraVSlot0x1B8(_out: PCVector2d): void {
    // Not yet ported. @0x40b3c
    throw new Error(
      "OZOrthoCamera: LiSimpleCamera vtable slot *0x1B8 not yet transcribed @0x40b3c",
    );
  }

  /** __ZN18PC_Sp_counted_base12weak_releaseEv — @0x40917 symbol-stub call. */
  protected _pcSpCountedBaseWeakRelease(_wcb: object): void {
    // Not yet ported. @0x40917
    throw new Error(
      "OZOrthoCamera: PC_Sp_counted_base::weak_release not yet transcribed @0x40917",
    );
  }
}
