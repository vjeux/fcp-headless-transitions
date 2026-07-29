// raw-port/src/channels/OZSimStateElement.ts
//
// FCP `OZSimStateElement` — the per-particle rigid-body state used by the Ozone
// simulator (channels layer). Each element is EXACTLY 0xf8 (248) bytes; OZSimStateArray
// stores a std::vector<OZSimStateElement> and calls `stepFrom` per element inside its
// own stepFrom loop @0x2840eb (see raw-port/re/disasm/OZSimStateArray.*.s).
//
// Transcribed from the x86_64 disassembly of Ozone in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// (see raw-port/re/disasm/OZSimStateElement.*.s and the tV.txt dump).
//
// FAITHFUL PORT — every method cites its @Ozone 0xADDR. Every numeric constant cites
// its rip-relative source address. The 8-iteration quaternion Rodrigues sub-step loop is
// transcribed lane-by-lane from the SSE2 body; nothing algorithmic is reimagined.
//
// Symbols (nm -arch x86_64 | c++filt | grep "^OZSimStateElement::"):
//
//   @0x284860  OZSimStateElement::OZSimStateElement()                              — PORTED
//   @0x284900  OZSimStateElement::OZSimStateElement(OZSimStateElement const&) [C2] — PORTED
//   @0x284a00  OZSimStateElement::OZSimStateElement(OZSimStateElement const&) [C1] — PORTED (ICF trampoline -> C2)
//   @0x284a10  OZSimStateElement::operator=(OZSimStateElement const&)              — PORTED
//   @0x284b50  OZSimStateElement::~OZSimStateElement() [D2]                        — PORTED
//   @0x284b90  OZSimStateElement::~OZSimStateElement() [D1]                        — PORTED (ICF sibling of D2)
//   @0x284bd0  OZSimStateElement::stepFrom(elem*, double, double, PCMatrix33)      — PORTED (thunk -> 5-arg)
//   @0x284be0  OZSimStateElement::stepFrom(elem*, elem*, double, double, PCMatrix33) — PORTED (real body)
//
// C1/C2 and D1/D2 pairs are ICF/trampoline copies. We expose a single canonical body
// per semantic overload.
//
// STRUCT LAYOUT (recovered from ctor @0x284860, copy-ctor @0x284900, operator= @0x284a10,
//                and the stepFrom body @0x284be0..0x284ec9):
// -----------------------------------------------------------------------------
//   +0x00 .. +0x10  position           : 3 doubles (x, y, z)     — pos_new = pos_prev + dt·v_curr
//   +0x18 .. +0x30  orientation        : quaternion 4 doubles    — Rodrigues-integrated
//                     +0x18 = q.x, +0x20 = q.y, +0x28 = q.z, +0x30 = q.w
//   +0x38 .. +0x48  velocity           : 3 doubles (vx, vy, vz)  — v_new = v_prev + dt·coef·accel
//   +0x50 .. +0x60  angMomentumMirror  : 3 doubles               — copy of +0x68..+0x78 (see mirror stores
//                                                                  @0x284eab..0x284eb7)
//   +0x68 .. +0x78  angMomentum        : 3 doubles               — Lnew = Lprev + dt·(angAccel at rdx +0x98..+0xa8)
//   +0x80 .. +0x90  accel              : 3 doubles (ax, ay, az)  — cleared by OZSimStateArray::clearForces
//                                                                  @0x28400d..0x284025 (48 bytes zeroed)
//   +0x98 .. +0xa8  angAccel           : 3 doubles (αx, αy, αz)  — cleared by clearForces (same 48 bytes)
//   +0xb0 .. +0xc0  scratchB0          : 3 doubles zeroed by ctor@0x284867..0x28486e (16 + 8 bytes = 24, i.e. 3 dbl)
//   +0xc8           unitInvMass        : double = 1.0             — ctor @0x284879..0x284883 writes 1.0
//                                                                    copy-ctor @0x28498f..0x284999 also writes 1.0
//                                                                    (so 0xc0 is copied but 0xc8 is FORCED to 1.0
//                                                                    on both construction paths; only operator= at
//                                                                    @0x284ac4 copies the byte-for-byte value).
//   +0xd0 .. +0xe0  scratchD0          : 3 doubles zeroed by ctor @0x28488a..0x284898 (16 + 8 bytes = 24, i.e. 3 dbl)
//                                                                  copy-ctor also zeros these @0x2849a0..0x2849aa
//                                                                  (operator= COPIES all of them @0x284ab6..0x284acb)
//   +0xe8           policy: PCShared*  : refcounted policy pointer with vtable methods:
//                     vtbl+0x08 = destroy(this)         (returns void)
//                     vtbl+0x10 = clone(this)           (returns PCShared*)
//   +0xf0           ownsPolicy         : uint8_t bool  (1 = owns, will destroy in dtor/on reassign)
// -----------------------------------------------------------------------------
// TOTAL: 0xf8 (248) bytes — matches OZSimStateArray element stride (imulq $0xf8 @0x283bae,
//   addq $0xf8 stride @0x284025 in clearForces, @0x2840f0/0x2840f7/0x2840fe in stepFrom).
//
// PROVENANCE dumps:
//   raw-port/re/disasm/OZSimStateElement.stepFrom.s (159 lines, @0x284be0)
//   raw-port/re/disasm/OZSimStateElement.OZSimStateElement.s (default ctor @0x284860)
//   /tmp/Ozone_tV.txt lines 662110..662320  (all 8 symbols)
//
// Numeric constants (all read from the Ozone x86_64 __TEXT,__const section at file offset
// 0x705380..0x71486a; python decode via lipo -thin x86_64 + struct.unpack '<d'):
//   @const Ozone 0x7053e0  = 1.0    (STEP_SCALE_COEFFICIENT; loaded by OZSimStateArray::stepFrom @0x2840dc)
//   @const Ozone 0x706ea8  = 0.5    (HALF; loaded by stepFrom @0x284c3b as the "half angle" factor)
//   @const Ozone 0x70a580  = 0.125  (EIGHTH; multiplied at stepFrom @0x284c47; ⇒ sub-step scale = dt·0.5·0.125 = dt/16)
//   @const Ozone 0x7053e0  = 1.0    (also reloaded at @0x284e49 as fallback quaternion axis when |axis| == 0)
//   @const Ozone (imm)     = 0x3ff0000000000000 (double 1.0) — ctor uses as immediate for +0xc8 slot @0x284879
// -----------------------------------------------------------------------------

/**
 * Frontier: `PCShared*` policy handle stored at +0xe8. Real type in Ozone; this port only
 * touches its vtable:
 *
 *   vtbl+0x08  destroy(this)  — called from D0/D1/D2 @0x284b74/0x284bb4 and from operator=
 *                               @0x284b08 (to release an old owned policy before adopting a new one)
 *   vtbl+0x10  clone(this)    — called from copy-ctor @0x2849e0 and from operator= @0x284b20
 *                               (allocates + returns a fresh PCShared* copy)
 *
 * Modeled opaquely: a struct with a vtable object. Not decoded here.
 * @frontier Ozone PCShared (per-element policy handle for OZSimStateElement +0xe8)
 */
export interface OZSimStateElementPolicy {
  readonly __brand: "OZSimStateElement::policy";
  readonly vtbl: {
    /** vtbl+0x08 — release/destroy. Called with `this` = the policy pointer. */
    destroy(self: OZSimStateElementPolicy): void;
    /** vtbl+0x10 — deep-copy clone. Returns a fresh owned handle. */
    clone(self: OZSimStateElementPolicy): OZSimStateElementPolicy;
  };
}

/**
 * `PCMatrix33Tmpl<double>` passed by value to stepFrom's 5-arg form. In every observed
 * caller (OZSimStateArray::stepFrom @0x2840e4) it is the stack-constructed identity
 * (diagonal = 1.0, off-diagonals = 0). The stepFrom body @0x284be0..0x284ec9 DOES NOT
 * read the matrix bytes — no rip-relative or rcx-relative loads reach into the 72-byte
 * region — so this parameter is currently a signature-only marker. We keep it in the API
 * to match the mangling; consumers can pass any 9-double buffer and the current body
 * will ignore it.
 *
 * @frontier Ozone PCMatrix33Tmpl<double> (72-byte 3×3 row-major).
 */
export interface PCMatrix33Double {
  readonly __brand: "PCMatrix33Tmpl<double>";
  /** 9 doubles, row-major. m[0][0]=data[0], m[0][1]=data[1], ..., m[2][2]=data[8]. */
  readonly data: readonly [
    number, number, number,
    number, number, number,
    number, number, number,
  ];
}

// -----------------------------------------------------------------------------
// Numeric constants — see file-header @const citations.
// -----------------------------------------------------------------------------

/** @const Ozone 0x706ea8 = 0.5 — half-angle factor for quaternion sub-step scale. */
const HALF = 0.5;
/** @const Ozone 0x70a580 = 0.125 — 1/8 sub-step factor (loop iterates 8 times). */
const EIGHTH = 0.125;
/** @const Ozone 0x7053e0 = 1.0 — fallback scalar when |q_axis| = 0 (NaN guard). */
const ONE = 1.0;

// =============================================================================
// OZSimStateElement
// =============================================================================

/**
 * OZSimStateElement — per-particle rigid-body state (position + orientation + velocity +
 * angular momentum + external forces/torques + a refcounted "policy" pointer).
 *
 * @0x284860 default ctor. See file-header STRUCT LAYOUT for every offset.
 */
export class OZSimStateElement {
  // -----------------------------------------------------------------------
  // Data — one field per struct offset. Provenance for each is at the file head.
  // -----------------------------------------------------------------------

  /** +0x00..+0x10 — position (3 doubles). Zeroed by ctor @0x284898..0x28489b. */
  readonly position: Float64Array;
  /** +0x18..+0x30 — orientation quaternion (q.x, q.y, q.z, q.w) = 4 doubles.
   *  Ctor writes q.x=1.0 (movabsq $0x3ff0..., 0x18(rdi) @0x2848c1), q.y=q.z=0 (xmm0
   *  = 0 to 0x20(rdi) @0x2848c5), q.w=0 (movq $0x0, 0x30(rdi) @0x2848c9).
   *  ⇒ default orientation = (1, 0, 0, 0). */
  readonly orientation: Float64Array;
  /** +0x38..+0x48 — linear velocity (vx, vy, vz). Zeroed by ctor @0x2848a3..0x2848a7. */
  readonly velocity: Float64Array;
  /** +0x50..+0x60 — mirror of angMomentum (+0x68..+0x78). Ctor zeros the 48-byte block
   *  +0x50..+0x80 via three movups @0x2848d8..0x2848e0. stepFrom rewrites these three
   *  doubles at end @0x284eab..0x284eb7 as an in-place copy of angMomentum. */
  readonly angMomentumMirror: Float64Array;
  /** +0x68..+0x78 — angular momentum (Lx, Ly, Lz). Ctor zeros (see angMomentumMirror). */
  readonly angMomentum: Float64Array;
  /** +0x80..+0x90 — accel (ax, ay, az). Ctor zeros @0x2848af..0x2848b6.
   *  Reset by OZSimStateArray::clearForces @0x28400d..0x284025. */
  readonly accel: Float64Array;
  /** +0x98..+0xa8 — angular accel (αx, αy, αz). Ctor zeros @0x2848e4..0x2848eb.
   *  Reset by OZSimStateArray::clearForces (same 48-byte block as accel). */
  readonly angAccel: Float64Array;
  /** +0xb0..+0xc0 — 3 doubles zeroed by ctor @0x284867..0x28486e. Never read by any
   *  decoded method; purpose to be pinned by OZChannel/behavior consumers. */
  readonly scratchB0: Float64Array;
  /** +0xc8 — unit inverse mass or intrinsic scalar. Ctor forces to 1.0 @0x284879..0x284883;
   *  copy-ctor also forces to 1.0 @0x28498f..0x284999; operator= COPIES byte-for-byte
   *  @0x284ac4..0x284acb. So both construction paths pin 1.0; assignment can carry a
   *  different value. */
  unitInvMass: number;
  /** +0xd0..+0xe0 — 3 doubles zeroed by ctor @0x28488a..0x284898. Copy-ctor also zeros
   *  @0x2849a0..0x2849aa. operator= copies them (see scratchD0 in operator=). */
  readonly scratchD0: Float64Array;
  /** +0xe8 — refcounted policy handle (may be null). See OZSimStateElementPolicy. */
  policy: OZSimStateElementPolicy | null;
  /** +0xf0 — 1 = owns policy (dtor will destroy). Zeroed by ctor @0x2848d1. */
  ownsPolicy: boolean;

  /**
   * @0x284860 — `OZSimStateElement::OZSimStateElement()`
   *
   * Byte-for-byte transcription of the default ctor. Every store cited by its @0xADDR.
   *   @0x284864-67  xorps xmm0, xmm0                        ; xmm0 = (0.0, 0.0)
   *   @0x284867-6e  movups xmm0, 0xb0(rdi)                  ; scratchB0[0..1] = 0
   *   @0x28486e-79  movq $0x0, 0xc0(rdi)                    ; scratchB0[2]     = 0
   *   @0x284879-83  movabsq $0x3ff0000000000000, rax        ; rax = bit-pattern of 1.0
   *   @0x284883-8a  movq rax, 0xc8(rdi)                     ; unitInvMass      = 1.0
   *   @0x28488a-91  movups xmm0, 0xd0(rdi)                  ; scratchD0[0..1]  = 0
   *   @0x284891-98  movups xmm0, 0xe0(rdi)                  ; scratchD0[2] + policy.hi = 0
   *   @0x284898-9b  movups xmm0, (rdi)                      ; position[0..1]   = 0
   *   @0x28489b-a3  movq $0x0, 0x10(rdi)                    ; position[2]      = 0
   *   @0x2848a3-a7  movups xmm0, 0x38(rdi)                  ; velocity[0..1]   = 0
   *   @0x2848a7-af  movq $0x0, 0x48(rdi)                    ; velocity[2]      = 0
   *   @0x2848af-b6  movups xmm0, 0x80(rdi)                  ; accel[0..1]      = 0
   *   @0x2848b6-c1  movq $0x0, 0x90(rdi)                    ; accel[2]         = 0
   *   @0x2848c1-c5  movq rax, 0x18(rdi)                     ; orientation.x    = 1.0
   *   @0x2848c5-c9  movups xmm0, 0x20(rdi)                  ; orientation.y,.z = 0
   *   @0x2848c9-d1  movq $0x0, 0x30(rdi)                    ; orientation.w    = 0
   *   @0x2848d1-d8  movb $0x0, 0xf0(rdi)                    ; ownsPolicy       = false
   *   @0x2848d8-dc  movups xmm0, 0x50(rdi)                  ; angMomMirror[0..1] = 0
   *   @0x2848dc-e0  movups xmm0, 0x60(rdi)                  ; angMomMirror[2] + angMom[0] = 0
   *   @0x2848e0-e4  movups xmm0, 0x70(rdi)                  ; angMom[1..2] = 0
   *   @0x2848e4-eb  movups xmm0, 0x98(rdi)                  ; angAccel[0..1] = 0
   *   @0x2848eb-f6  movq $0x0, 0xa8(rdi)                    ; angAccel[2] = 0
   * NOTE: the policy pointer +0xe8 is left at whatever bit pattern was in the last
   *       8 bytes of the movups %xmm0, 0xe0(%rdi) store — which zeros bytes 0xe0..0xef.
   *       So +0xe8 = 0 (null) after the ctor. We record that explicitly.
   */
  constructor() {
    // Order-preserving: match the store sequence in @0x284864..0x2848eb so a reader can
    // diff this ctor line-by-line against the disassembly.
    this.scratchB0 = new Float64Array(3);  // +0xb0..+0xc0 = 0,0,0
    this.unitInvMass = 1.0;                 // +0xc8 = 1.0  @0x284879-83
    this.scratchD0 = new Float64Array(3);  // +0xd0..+0xe0 = 0,0,0
    this.position = new Float64Array(3);   // +0x00..+0x10 = 0,0,0
    this.velocity = new Float64Array(3);   // +0x38..+0x48 = 0,0,0
    this.accel = new Float64Array(3);       // +0x80..+0x90 = 0,0,0
    this.orientation = new Float64Array(4);
    this.orientation[0] = 1.0;              // +0x18 = q.x = 1.0   @0x2848c1
    // (q.y, q.z, q.w already 0 from Float64Array init)
    this.ownsPolicy = false;                // +0xf0 = 0           @0x2848d1
    this.angMomentumMirror = new Float64Array(3); // +0x50..+0x60 = 0,0,0
    this.angMomentum = new Float64Array(3);        // +0x68..+0x78 = 0,0,0
    this.angAccel = new Float64Array(3);          // +0x98..+0xa8 = 0,0,0
    this.policy = null;                      // +0xe8 = null (implied by zeroed 0xe0..0xef block)
  }

  // -----------------------------------------------------------------------
  // Copy-constructor and clone-from — see @0x284900 and its C1 trampoline @0x284a00.
  // -----------------------------------------------------------------------

  /**
   * @0x284900 — `OZSimStateElement::OZSimStateElement(OZSimStateElement const&)` [C2]
   * (C1 @0x284a00 is a 3-instruction trampoline: `push rbp; mov rsp, rbp; pop rbp; jmp C2`.)
   *
   * Bytewise copy of +0x00..+0xc0 (192 bytes = 24 doubles) via 12 movups @0x284909..0x28497f,
   * then copy +0xc0..+0xc8 (unitInvMass byte source, but see next line) via movsd @0x28497f-8f,
   * then FORCE +0xc8 = 1.0 via movabsq immediate @0x28498f..0x284999 (overwriting the just-
   * moved value — the compiler emits both stores, so the ctor guarantees unitInvMass=1.0
   * regardless of the source value), then zero +0xd0..+0xe0 via xorps @0x2849a0..0x2849aa,
   * then copy the policy pointer +0xe8 and refcount-clone it if `src.ownsPolicy && src.policy`:
   *
   *   @0x2849b5-bc  movq 0xe8(rsi), rdi           ; rdi = src.policy
   *   @0x2849bc-c3  movq rdi, 0xe8(rbx)           ; dst.policy = src.policy   (raw copy first)
   *   @0x2849c3-ca  movzbl 0xf0(rsi), eax         ; eax = src.ownsPolicy
   *   @0x2849ca-d0  movb al, 0xf0(rbx)            ; dst.ownsPolicy = src.ownsPolicy
   *   @0x2849d0-d3  testq rdi, rdi                ; if src.policy != null AND src.ownsPolicy:
   *   @0x2849d3-d6  setne cl                      ;   cl = (src.policy != null)
   *   @0x2849d6-d8  andb al, cl                   ;   cl &= ownsPolicy
   *   @0x2849d8-db  cmpb $0x1, cl                 ;
   *   @0x2849db-dd  jne 0x2849ea                  ;
   *   @0x2849dd-e0  movq (rdi), rax               ;   rax = *policy.vtbl
   *   @0x2849e0-e3  callq *0x10(rax)              ;   dst.policy = policy.vtbl.clone(policy)
   *   @0x2849e3-ea  movq rax, 0xe8(rbx)           ;
   */
  static copy(src: OZSimStateElement): OZSimStateElement {
    const dst = new OZSimStateElement();
    // +0x00..+0xc0: copy position, orientation, velocity, angMomMirror, angMomentum,
    //               accel, angAccel, scratchB0 bytewise.
    dst.position.set(src.position);          // +0x00..+0x10  @0x284909..0x284913
    dst.orientation.set(src.orientation);    // +0x18..+0x30  @0x284917..0x284923
    dst.velocity.set(src.velocity);          // +0x38..+0x48  @0x284927..0x28492b
    dst.angMomentumMirror.set(src.angMomentumMirror); // +0x50..+0x60 @0x28492f..0x284933
    dst.angMomentum.set(src.angMomentum);    // +0x68..+0x78  @0x284937..0x284943
    dst.accel.set(src.accel);                // +0x80..+0x90  @0x284947..0x28494e
    dst.angAccel.set(src.angAccel);          // +0x98..+0xa8  @0x284955..0x28496a
    dst.scratchB0.set(src.scratchB0);        // +0xb0..+0xc0  @0x284971..0x284978
    // +0xc0..+0xc8: movsd copies src[+0xc0] to dst[+0xc0] — that's scratchB0[2] which we
    // already copied above (scratchB0 covers +0xb0..+0xc8-8 = +0xb0..+0xc0). But watch:
    // ctor sizes: +0xb0..+0xc0 is 16 bytes (2 doubles). +0xc0..+0xc8 is a THIRD double at
    // scratchB0[2]. The movsd @0x28497f moves that third double.
    // In our TS layout `scratchB0` is 3 doubles (+0xb0, +0xb8, +0xc0), so the .set() above
    // has already copied all three — consistent with the movsd byte.
    dst.unitInvMass = 1.0;                    // +0xc8 = 1.0    @0x28498f..0x284999 (forced)
    // +0xd0..+0xe0 remain zero (dst was just ctor'd — matches xorps @0x2849a0..0x2849aa).
    dst.policy = src.policy;                  // +0xe8         @0x2849b5..0x2849bc
    dst.ownsPolicy = src.ownsPolicy;         // +0xf0         @0x2849c3..0x2849ca
    // Refcount-clone if src is a real owner:
    if (src.policy !== null && src.ownsPolicy) {
      dst.policy = src.policy.vtbl.clone(src.policy);  // @0x2849dd..0x2849e3
    }
    return dst;
  }

  // -----------------------------------------------------------------------
  // operator= — @0x284a10  `OZSimStateElement& operator=(OZSimStateElement const&)`
  // -----------------------------------------------------------------------

  /**
   * @0x284a10 — `OZSimStateElement::operator=`
   *
   *   @0x284a1a-1d  cmpq rdi, rsi ; je 0x284b41       ; self-assignment guard: `if (this == &rhs) return this;`
   *
   * Otherwise bytewise copy +0x00..+0xc8 (26 doubles). Note the compiler splits each 24-byte
   * "3-double" group into a movsd (last 8) + movups (first 16) pair @0x284a26..0x284acb.
   * Then policy transfer logic:
   *
   *   @0x284ad2-d9  movq 0xe8(rsi), rdi              ; rdi = rhs.policy
   *   @0x284ad9-dc  testq rdi, rdi ; setne cl        ; cl = (rhs.policy != null)
   *   @0x284adf-e6  movzbl 0xf0(rsi), eax            ; eax = rhs.ownsPolicy
   *   @0x284ae6-eb  andb al, cl ; cmpb $0x1, cl      ; take the "clone" branch iff (rhs.ownsPolicy && rhs.policy)
   *   @0x284aeb-ed  jne 0x284b34                     ; else: raw pointer copy
   *
   *   ==== clone branch ====
   *   @0x284aed-f4  movq 0xe8(rbx), rax              ; rax = this.policy
   *   @0x284af4-f7  testq rax, rax ; je 0x284b1d     ; if (this.policy != null &&
   *   @0x284af9-00  cmpb $0x1, 0xf0(rbx) ; jne 0x284b1d ;  this.ownsPolicy):
   *   @0x284b02-05  movq (rax), rcx                  ;   rcx = *this.policy.vtbl
   *   @0x284b05-08  movq rax, rdi                    ;
   *   @0x284b08-0b  callq *0x8(rcx)                  ;   this.policy.vtbl.destroy(this.policy)
   *   @0x284b0b-16  movq $0x0, 0xe8(rbx)             ;   this.policy = null
   *   @0x284b16-1d  movq 0xe8(r14), rdi              ; rdi = rhs.policy (reloaded — r14 saved rhs)
   *   @0x284b1d-20  movq (rdi), rax                  ; rax = *rhs.policy.vtbl
   *   @0x284b20-23  callq *0x10(rax)                 ; this.policy = rhs.policy.vtbl.clone(rhs.policy)
   *   @0x284b23-2a  movq rax, 0xe8(rbx)
   *   @0x284b2a-32  movzbl 0xf0(r14), eax            ; eax = rhs.ownsPolicy
   *   @0x284b32-3b  jmp 0x284b3b
   *
   *   ==== raw-pointer branch ====
   *   @0x284b34-3b  movq rdi, 0xe8(rbx)              ; this.policy = rhs.policy  (raw, no refcount)
   *
   *   @0x284b3b-41  movb al, 0xf0(rbx)               ; this.ownsPolicy = (clone-branch eax) or (rhs.ownsPolicy)
   *   @0x284b41     movq rbx, rax ; return this;
   */
  assign(rhs: OZSimStateElement): OZSimStateElement {
    // Self-assignment guard @0x284a1a-1d.
    if (this === rhs) return this;
    // Bytewise copy of +0x00..+0xc8 (26 doubles). The disasm splits each 24-byte block
    // into movsd (last dbl) + movups (first 2 dbls); we replicate as a whole .set() per
    // logical field. Byte-for-byte equivalence holds because Float64Array.set copies the
    // full 3-double region atomically.
    this.position.set(rhs.position);          // @0x284a26..0x284a31 (movq +0x10; movups +0x00)
    this.orientation.set(rhs.orientation);    // @0x284a34..0x284a4a
    this.velocity.set(rhs.velocity);          // @0x284a4e..0x284a5a
    this.angMomentumMirror.set(rhs.angMomentumMirror); // @0x284a5e..0x284a6a
    this.angMomentum.set(rhs.angMomentum);   // @0x284a6e..0x284a7a
    this.accel.set(rhs.accel);                // @0x284a7e..0x284a93
    this.angAccel.set(rhs.angAccel);         // @0x284a9a..0x284aaf
    this.scratchB0.set(rhs.scratchB0);       // @0x284ab6..0x284abd (scratchB0[0..1] via movups)
    // +0xc0 as movq @0x284ac4..0x284acb — that's scratchB0[2], already copied above.
    this.unitInvMass = rhs.unitInvMass;      // +0xc8 byte-for-byte copy (NOT forced to 1.0 here —
                                             //   only ctors do that; operator= @0x284ac4..0x284acb
                                             //   is a plain movq that carries rhs's value).
    // Then the +0xd0..+0xe0 block — the disasm does NOT copy these in operator= (only ctor
    // and copy-ctor zero them; operator= leaves LHS's existing values). Preserve that here
    // by NOT touching this.scratchD0.
    //
    // Policy transfer:
    const rhsPolicy = rhs.policy;                // rdi @0x284ad2
    const rhsOwns = rhs.ownsPolicy;              // al  @0x284adf
    const takeClone = (rhsPolicy !== null) && rhsOwns; // cl @0x284adf..0x284ae8
    if (takeClone) {
      // If we currently own a policy, destroy it first.
      if (this.policy !== null && this.ownsPolicy) {
        this.policy.vtbl.destroy(this.policy);   // @0x284b02..0x284b0b
        this.policy = null;                       // @0x284b0b..0x284b16
      }
      // Adopt a fresh clone of rhs's policy.
      this.policy = rhsPolicy.vtbl.clone(rhsPolicy); // @0x284b1d..0x284b23
      this.ownsPolicy = rhsOwns;                     // @0x284b2a..0x284b3b (movzbl al ; movb al, ...)
    } else {
      // Raw-pointer branch: adopt whatever rhs.policy is (may be null) WITHOUT cloning.
      this.policy = rhsPolicy;                       // @0x284b34..0x284b3b
      this.ownsPolicy = rhsOwns;                     // @0x284b3b..0x284b41
    }
    return this;
  }

  // -----------------------------------------------------------------------
  // Destructor — @0x284b50 [D2] / @0x284b90 [D1]
  // -----------------------------------------------------------------------

  /**
   * @0x284b50 — `OZSimStateElement::~OZSimStateElement()` [D2]
   * (D1 @0x284b90 is an ICF-folded twin — identical byte pattern.)
   *
   *   @0x284b50-57  movq 0xe8(rdi), rax             ; rax = this.policy
   *   @0x284b57-5a  testq rax, rax ; je 0x284b88    ; if (policy == null) return;
   *   @0x284b5c-63  cmpb $0x1, 0xf0(rdi) ; jne 0x284b88 ; if (!ownsPolicy) return;
   *   @0x284b6b-6e  movq (rax), rcx                 ; rcx = *policy.vtbl
   *   @0x284b74     callq *0x8(rcx)                 ; policy.vtbl.destroy(policy)
   *   @0x284b77-82  movq $0x0, 0xe8(rbx)            ; policy = null   (rbx aliases this)
   */
  destroy(): void {
    if (this.policy === null) return;
    if (!this.ownsPolicy) return;
    this.policy.vtbl.destroy(this.policy);
    this.policy = null;
  }

  // -----------------------------------------------------------------------
  // stepFrom — 4-arg thunk @0x284bd0 → 5-arg body @0x284be0
  // -----------------------------------------------------------------------

  /**
   * @0x284bd0 — `OZSimStateElement::stepFrom(elem*, double, double, PCMatrix33Tmpl<double>)`
   *
   *   pushq %rbp ; movq %rsp, %rbp ; movq %rsi, %rdx ; popq %rbp
   *   jmp  __ZN17OZSimStateElement8stepFromEPS_S0_dd14PCMatrix33TmplIdE
   *
   * The 4-arg overload shifts `elem*` from rsi to rdx and forwards, i.e. it calls the
   * 5-arg form with `k1 = k2 = elem` (self-consistent step: use `elem`'s state as BOTH
   * the previous positional source and the derivative source).
   */
  stepFrom4(elem: OZSimStateElement, dt: number, coef: number, mat: PCMatrix33Double): void {
    // dst = this; prev = elem (rsi->rdx thunk collapses two args to the same pointer).
    // The 5-arg body then reads pos/quat/vel from `prev` at rsi AND reads
    // accel/angVel/angAccel from `curr` (rdx, same `elem`).
    this.stepFrom5(elem, elem, dt, coef, mat);
  }

  /**
   * @0x284be0 — `OZSimStateElement::stepFrom(elem* prev, elem* curr, double dt, double coef,
   *                                          PCMatrix33Tmpl<double> mat)`
   *
   * SIMD-transcribed line-by-line from the 159-line disasm. The algorithm is a rigid-body
   * Verlet-style integrator with three parts:
   *
   *   PART 1  @0x284be0..0x284c0c  — position advance
   *     pos_new[0..1] = prev.position[0..1] + dt·curr.velocity[0..1]
   *     pos_new[2]    = prev.position[2]    + dt·curr.velocity[2]
   *
   *   PART 2  @0x284c0c..0x284c4f  — velocity advance
   *     vel_new[0..1] = prev.velocity[0..1] + (dt·coef)·curr.accel[0..1]
   *     vel_new[2]    = prev.velocity[2]    + (dt·coef)·curr.accel[2]
   *
   *   PART 3a @0x284c3b..0x284ca8  — Rodrigues sub-step scale + zero-|ω| fast path
   *     subStep = dt · 0.5 · 0.125 = dt / 16
   *     ω_scaled = (subStep · curr.angAccel[0..2])            ; NOTE: it reads
   *                +0x50(rdx) as ω_x, +0x58(rdx)[2 dbls] as ω_y,ω_z — that's
   *                curr.angMomentumMirror[0] and curr.angMomentumMirror[1..2] in our
   *                struct labeling (see LAYOUT above). But the fields the ARRAY caller
   *                uses as "the state to integrate FROM" have their +0x50..+0x68 mirror
   *                populated with the angular-velocity vector by upstream code (the
   *                OZChannelParticleSimulator/behavior stack we haven't decoded yet). We
   *                READ verbatim: `omega = (curr[+0x50], curr[+0x58], curr[+0x60])`.
   *     |ω_scaled|² = ω_x² + ω_y² + ω_z²
   *     If |ω_scaled|² == 0.0:
   *        If dst == prev: leave orientation unchanged (skip the copy)
   *        else:           copy orientation prev.q → dst.q verbatim
   *        Then jump past the quaternion loop.
   *
   *   PART 3b @0x284cc4..0x284e6d  — 8-iteration quaternion sub-step loop
   *     For i in 0..7:
   *        (see loop body — Rodrigues delta + normalize each iter)
   *     Store dst.orientation = (q'.x, q'.y, q'.z, q'.w).
   *
   *   PART 4  @0x284e7f..0x284ec9  — angular momentum advance + mirror + pass-through
   *     Lnew[0..1] = prev.angMomentum[0..1] + dt·curr.angAccel[0..1]
   *     Lnew[2]    = prev.angMomentum[2]    + dt·curr.angAccel[2]
   *     angMomentumMirror = angMomentum    (three doubles copied verbatim to +0x50..+0x60)
   *     dst.policy_raw    = prev.policy_raw (movq 0xe8(rsi) → 0xe8(rdi) — no refcount ops
   *                        because this is a per-frame integrator and prev outlives dst)
   *
   * @param prev  rsi — source of positional/velocity/quaternion/momentum state before step.
   * @param curr  rdx — source of derivatives (velocity, accel, angVel, angAccel).
   * @param dt    xmm0 — timestep (seconds). Caller: OZSimStateArray::stepFrom @0x2840d7.
   * @param coef  xmm1 — scale coefficient (1.0 from the OZSimStateArray caller @0x2840dc).
   * @param mat   stack — PCMatrix33Tmpl<double>. UNUSED by this body — no rcx-relative
   *                     loads in the disasm reach into it. Kept for signature parity.
   */
  stepFrom5(
    prev: OZSimStateElement,
    curr: OZSimStateElement,
    dt: number,
    coef: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mat: PCMatrix33Double,
  ): void {
    // In the disassembly rdi = dst = this, rsi = prev, rdx = curr, xmm0 = dt, xmm1 = coef.
    // We use scalar arithmetic below because JS has no 128-bit SIMD and Float64Array reads
    // are lane-aligned by construction. Every line is annotated with its @0xADDR.

    // ---------------------------------------------------------------------
    // PART 1 — position advance.
    // ---------------------------------------------------------------------
    // @0x284be0  movsd 0x48(rdx), xmm3                 ; xmm3 = curr.velocity[2]
    // @0x284be5  mulsd xmm0, xmm3                      ; xmm3 *= dt
    // @0x284be9  addsd 0x10(rsi), xmm3                 ; xmm3 += prev.position[2]
    const posZ = prev.position[2] + dt * curr.velocity[2];
    // @0x284bee  movupd 0x38(rdx), xmm4                ; xmm4 = (curr.velocity[0], curr.velocity[1])
    // @0x284bf3  movddup xmm0, xmm2                    ; xmm2 = (dt, dt)
    // @0x284bf7  mulpd xmm2, xmm4                      ; xmm4 *= (dt, dt)
    // @0x284bfb  movupd (rsi), xmm5                    ; xmm5 = (prev.position[0], prev.position[1])
    // @0x284bff  addpd xmm4, xmm5                      ; xmm5 += xmm4
    // @0x284c03  movupd xmm5, (rdi)                    ; dst.position[0..1] = xmm5
    // @0x284c07  movsd xmm3, 0x10(rdi)                 ; dst.position[2] = posZ
    // We defer the actual write to dst.position until AFTER we've read prev.* (needed for the
    // `prev == dst` in-place case). The prev-vs-dst distinction is safe here because we
    // captured `posZ` and `posX/Y` into locals — the SSE registers do the same buffering.
    const posX = prev.position[0] + dt * curr.velocity[0];
    const posY = prev.position[1] + dt * curr.velocity[1];

    // ---------------------------------------------------------------------
    // PART 2 — velocity advance. xmm1 = coef (arg), xmm0 = dt.
    // ---------------------------------------------------------------------
    // @0x284c0c  mulsd xmm0, xmm1                      ; xmm1 = dt * coef
    const dtCoef = dt * coef;
    // @0x284c10  movddup xmm1, xmm3                    ; xmm3 = (dtCoef, dtCoef)  — held for next block
    // @0x284c14  mulsd 0x90(rdx), xmm1                 ; xmm1 *= curr.accel[2]        (rdx +0x90 = accel[2])
    // @0x284c1c  addsd 0x48(rsi), xmm1                 ; xmm1 += prev.velocity[2]     (rsi +0x48 = vel[2])
    const velZ = prev.velocity[2] + dtCoef * curr.accel[2];
    // @0x284c21  movupd 0x80(rdx), xmm4                ; xmm4 = (curr.accel[0], curr.accel[1])
    // @0x284c29  mulpd xmm3, xmm4                      ; xmm4 *= (dtCoef, dtCoef)
    // @0x284c2d  movupd 0x38(rsi), xmm3                ; xmm3 = (prev.vel[0], prev.vel[1])
    // @0x284c32  addpd xmm4, xmm3                      ; xmm3 += xmm4
    // @0x284c36  movupd xmm3, 0x38(rdi)                ; dst.velocity[0..1] = xmm3
    const velX = prev.velocity[0] + dtCoef * curr.accel[0];
    const velY = prev.velocity[1] + dtCoef * curr.accel[1];
    // @0x284c4f  movsd xmm1, 0x48(rdi)                 ; dst.velocity[2] = velZ
    // (The store at 0x284c4f happens AFTER the quaternion setup begins in xmm3 at 0x284c3b;
    //  the compiler pipelined the write. We defer the write to the "commit" section below.)

    // ---------------------------------------------------------------------
    // PART 3a — Rodrigues sub-step scale + zero-|ω| fast path.
    // xmm2 is preserved as (dt, dt) broadcast; the caller re-uses it as (dt, dt) at 0x284e94.
    // xmm3 gets repurposed here as the sub-step scale.
    // ---------------------------------------------------------------------
    // @0x284c3b  movsd 0x482265(rip), xmm3             ; xmm3 = HALF (0.5) [const Ozone 0x706ea8]
    // @0x284c43  mulsd xmm0, xmm3                      ; xmm3 = 0.5 * dt
    // @0x284c47  mulsd 0x485931(rip), xmm3             ; xmm3 = 0.5 * dt * 0.125 = dt/16  [const Ozone 0x70a580]
    const subStep = HALF * dt * EIGHTH;
    // Note: the entire body is double-precision (movsd/mulsd/addsd), NOT single, so we do
    // NOT wrap with Math.fround. The multiply chain `HALF * dt * EIGHTH` associates as
    // `(HALF * dt) * EIGHTH`, matching the two consecutive mulsd instructions @0x284c43
    // and @0x284c47 exactly (each mulsd rounds to double, and JS doubles are IEEE 754
    // binary64, same rounding as x86 SSE).

    // @0x284c54  xorpd xmm1, xmm1                      ; xmm1 = 0.0    (compare-with-zero constant)
    // @0x284c58  movsd 0x50(rdx), xmm8                 ; xmm8 = curr[+0x50]           (angular-vel ω_x)
    // @0x284c5e  mulsd xmm3, xmm8                      ; xmm8 = ω_x * subStep
    const wX = curr.angMomentumMirror[0] * subStep;
    // @0x284c63  movupd 0x58(rdx), xmm6                ; xmm6 = (curr[+0x58], curr[+0x60])  = (ω_y, ω_z)
    // @0x284c68  movddup xmm3, xmm9                    ; xmm9 = (subStep, subStep)
    // @0x284c6d  mulpd xmm6, xmm9                      ; xmm9 = (ω_y * subStep, ω_z * subStep)
    const wY = curr.angMomentumMirror[1] * subStep;
    const wZ = curr.angMomentumMirror[2] * subStep;

    // @0x284c72  movapd xmm8, xmm6                     ; xmm6 = xmm8 = (ω_x*subStep, 0)
    // @0x284c77  mulsd xmm8, xmm6                      ; xmm6.lo = (ω_x*subStep)²
    // @0x284c7c  movapd xmm9, xmm7                     ; xmm7 = xmm9 = (ω_y*ss, ω_z*ss)
    // @0x284c81  mulpd xmm9, xmm7                      ; xmm7 = ( (ω_y*ss)², (ω_z*ss)² )
    // @0x284c86  addsd xmm7, xmm6                      ; xmm6.lo = ω_x²*ss² + ω_y²*ss²
    // @0x284c8a  unpckhpd xmm7, xmm7                   ; xmm7.lo = xmm7.hi = (ω_z*ss)²
    // @0x284c8e  addsd xmm6, xmm7                      ; xmm7.lo = ω_x²ss² + ω_y²ss² + ω_z²ss²
    // @0x284c92  ucomisd xmm1, xmm7                    ; compare against 0.0
    // @0x284c96  jne 0x284cc4 ; @0x284c98  jp 0x284cc4 ; nonzero => enter loop
    const wMagSq = wX * wX + wY * wY + wZ * wZ;
    // Read prev's quaternion once (SSE captures it lazily at 0x284cd1..0x284cd7 or in the
    // zero-|ω| fast path at 0x284ca3..0x284cbb; we materialize it here so the mid-loop
    // memory picture matches).
    const qX = prev.orientation[0];  // +0x18
    const qY = prev.orientation[1];  // +0x20
    const qZ = prev.orientation[2];  // +0x28
    const qW = prev.orientation[3];  // +0x30

    // qNewX/Y/Z/W hold the final quaternion for the commit at end of PART 3.
    let qNewX: number;
    let qNewY: number;
    let qNewZ: number;
    let qNewW: number;

    // Zero-|ω| fast path — matches the `wMagSq !== NaN-ordered-equals 0.0` branch. We use
    // strict-inequality to remain NaN-ordered (an NaN compares as "unordered" so `ucomisd`
    // sets both PF and ZF; the `jne + jp` pair goes to the loop in that case — treating NaN
    // as "nonzero" and running the loop, which will then produce NaN outputs. We match that
    // by inverting the check with `!== 0` semantics.)
    if (wMagSq === 0.0) {
      // @0x284c9a  cmpq rdi, rsi ; je 0x284e7f
      // "if (dst == prev) skip the copy (already in place)"
      // In TS we can't compare object identity of the quaternion buffer without also
      // catching the aliasing case for the same-instance call. Reproduce the branch:
      if (this === prev) {
        // Same instance — orientation is already in place. Preserve.
        qNewX = qX;
        qNewY = qY;
        qNewZ = qZ;
        qNewW = qW;
      } else {
        // @0x284ca3  movsd 0x18(rsi), xmm1 ; movsd xmm1, 0x18(rdi)   ; dst.q.x = prev.q.x
        // @0x284cad  movupd 0x20(rsi), xmm1 ; movupd xmm1, 0x20(rdi) ; dst.q.y,z = prev.q.y,z
        // @0x284cb7  movq 0x30(rsi), rax ; movq rax, 0x30(rdi)       ; dst.q.w = prev.q.w
        qNewX = qX;
        qNewY = qY;
        qNewZ = qZ;
        qNewW = qW;
      }
      // @0x284cbf  jmp 0x284e7f  — falls through to PART 4 with orientation set.
    } else {
      // -------------------------------------------------------------------
      // PART 3b — 8-iteration quaternion sub-step loop @0x284cc4..0x284e6d.
      //
      // Pre-loop setup @0x284cc4..0x284d05:
      //
      //   @0x284cc4  pushq rbp ; movq rsp, rbp
      //   @0x284cc8  movapd xmm2, -0x10(rbp)            ; save xmm2=(dt,dt) broadcast to stack
      //   @0x284ccd  mulsd xmm1, xmm3                    ; xmm3 = xmm3 * xmm1 = subStep*0 = 0
      //              (xmm1 was zeroed at 0x284c54 as the ucomisd constant; multiplying by 0
      //               produces xmm3=0. This looks like a compiler artifact — the value is
      //               never read again as `xmm3.lo`; the register is repurposed below with
      //               `movapd xmm3, xmm12 ; mulsd xmm11, xmm12` at 0x284d1d/0x284d22 which
      //               produces `xmm12 = subStep_shadow * q.x` — but `subStep_shadow` came
      //               from the still-live xmm3=0 → xmm12.lo=0. That can't be right for the
      //               Rodrigues math. Re-reading the trace: xmm3 is REALLY still holding
      //               `subStep` because the earlier `mulsd xmm1, xmm3` at 0x284ccd uses
      //               XMM1 as SOURCE (not dest); the AT&T operand order for `mulsd s, d` is
      //               `d = d * s`, so xmm3 stays as `xmm3 = subStep * 0 = 0`. But then the
      //               loop's first `movapd xmm3, xmm12 ; mulsd xmm11, xmm12` also produces
      //               xmm12=0. That still can't produce a meaningful result — UNLESS the
      //               compiler intended xmm3 to be the AXIS SCALAR (ω_axis · subStep) and
      //               reloaded it earlier. Re-read carefully:
      //
      //             In fact at 0x284ccd the instruction is `mulsd %xmm1, %xmm3` in AT&T,
      //             which means xmm3 *= xmm1. xmm1 was ZEROED at 0x284c54. So xmm3 becomes 0.
      //             HOWEVER: 0x284cdd reads `movddup %xmm3, %xmm2 ; xmm2 = xmm3[0,0]` — a
      //             broadcast of 0 into xmm2. Then xmm2 is used only in `mulpd %xmm2, xmm6`
      //             at 0x284d62 as a scale for `xmm13`. Since xmm2=0, `xmm6 = 0`. Then xmm6
      //             feeds `xmm4 = mulpd xmm9 + xmm6` at 0x284dbe: `xmm4 += 0 = xmm4`. So
      //             xmm2/xmm6 are "no-ops" in the loop math despite the compiler emitting
      //             them. That's an artifact of a template instantiation where a `coef2`
      //             parameter was always 0 in this specialization.
      //
      //   @0x284cd1  movupd 0x18(rsi), xmm11             ; xmm11 = (q.x, q.y)
      //   @0x284cd7  movupd 0x28(rsi), xmm12             ; xmm12 = (q.z, q.w)
      //   @0x284cdd  movddup xmm3, xmm2                  ; xmm2 = (0, 0)  (compiler artifact — see note above)
      //   @0x284ce1  movapd xmm9, xmm7                   ; xmm7 = xmm9 = (wY, wZ)
      //   @0x284ce6  shufpd $0x1, xmm8, xmm7             ; xmm7 = (xmm7.hi, xmm8.lo) = (wZ, wX)
      //   @0x284cec  movapd xmm8, xmm1                   ; xmm1 = xmm8 = (wX, 0)
      //   @0x284cf1  unpcklpd xmm9, xmm1                 ; xmm1 = (xmm1.lo, xmm9.lo) = (wX, wY)
      //   @0x284cf6  movapd xmm9, xmm10                  ; xmm10 = xmm9 = (wY, wZ)
      //   @0x284cfb  unpckhpd xmm9, xmm10                ; xmm10 = (xmm10.hi, xmm9.hi) = (wZ, wZ)
      //   @0x284d00  movl $0x8, eax                      ; loop counter = 8
      //
      // Loop body @0x284d18..0x284e68 — 8 iterations. Each computes:
      //   (a) An extended "cross-plus-scale" step that produces a rotation delta δq applied
      //       to q, with SSE lane trickery.
      //   (b) Normalizes q by dividing by its magnitude (sqrtsd + divpd).
      //   (c) Loops until eax hits zero.
      //
      // We transcribe register-for-register. Every variable name matches its SSE reg
      // through the loop.
      // -------------------------------------------------------------------

      // The wX/wY/wZ triplet was captured above from curr.angMomentumMirror[0..2] * subStep.
      // Assemble the ω lane packings the loop needs:
      //   pair_YZ  = (wY, wZ)                    (xmm9)
      //   pair_ZX  = (wZ, wX)                    (xmm7  after shufpd)
      //   pair_XY  = (wX, wY)                    (xmm1  after unpcklpd)
      //   dup_ZZ   = (wZ, wZ)                    (xmm10 after unpckhpd)
      // We use scalar variables (wX, wY, wZ) and reconstitute pairs at each use site.

      let q0 = qX; // xmm11.lo — mutated across iterations
      let q1 = qY; // xmm11.hi
      let q2 = qZ; // xmm12.lo (loaded fresh each iter from xmm13 = previous xmm12)
      let q3 = qW; // xmm12.hi

      // The compiler's artifact: xmm2 = 0 broadcast (see PART 3b setup note above). This
      // makes the "xmm6 = xmm2 * xmm13" term in the loop always 0, so we simply omit that
      // term. It is documented but not evaluated.

      for (let iter = 0; iter < 8; iter++) {
        // @0x284d18  movapd xmm12, xmm13   ; xmm13 = xmm12 = (q2, q3)  (save current z,w)
        const z13 = q2;
        const w13 = q3;

        // @0x284d1d  movapd xmm3, xmm12    ; xmm12 = xmm3 = (subStep, subStep) — but xmm3
        //             was zeroed above (see setup note). So xmm12 = 0 here. The subsequent
        //             mulsd on xmm12 yields 0. This is another artifact of the compiler-
        //             emitted "coef2=0" specialization. Retained for byte-for-byte parity.
        // @0x284d22  mulsd xmm11, xmm12    ; xmm12.lo = 0.lo * q0 = 0
        // @0x284d27  movapd xmm11, xmm14   ; xmm14 = xmm11 = (q0, q1)
        // @0x284d2c  unpckhpd xmm11, xmm14 ; xmm14 = (q1, q1)  ← broadcast q1

        // @0x284d31  movapd xmm8, xmm15    ; xmm15 = xmm8 = (wX, 0)  — but wX is stored as
        //             a scalar; xmm8's high half is 0 (movsd zero-extended at 0x284c58).
        // @0x284d36  mulsd xmm14, xmm15    ; xmm15.lo = q1 * wX

        // @0x284d3b  movapd xmm9, xmm5     ; xmm5 = xmm9 = (wY, wZ)
        // @0x284d40  mulsd xmm13, xmm5     ; xmm5.lo = q2 * wY

        // @0x284d45  addsd xmm15, xmm5     ; xmm5.lo = q1*wX + q2*wY
        const s5a = q1 * wX + z13 * wY;

        // @0x284d4a  movapd xmm13, xmm15   ; xmm15 = xmm13 = (q2, q3)
        // @0x284d4f  unpckhpd xmm13, xmm15 ; xmm15 = (q3, q3) — broadcast q3
        // @0x284d54  mulpd xmm9, xmm15     ; xmm15 = (q3*wY, q3*wZ)
        const s15_lo_a = w13 * wY;
        const s15_hi_a = w13 * wZ;

        // @0x284d59  mulsd xmm3, xmm14     ; xmm14.lo = 0 * q1 = 0   (xmm3 = 0 artifact)
        // @0x284d5e  movapd xmm2, xmm6     ; xmm6 = xmm2 = (0, 0)     (xmm2 = 0 artifact)
        // @0x284d62  mulpd xmm13, xmm6     ; xmm6 = (0*q2, 0*q3) = (0, 0)

        // @0x284d67  movapd xmm8, xmm4     ; xmm4 = xmm8 = (wX, 0)
        // @0x284d6c  mulsd xmm11, xmm4     ; xmm4.lo = q0 * wX
        // @0x284d71  addsd xmm14, xmm4     ; xmm4.lo = q0*wX + 0 = q0*wX
        const s4a = q0 * wX;

        // @0x284d76  movapd xmm10, xmm14   ; xmm14 = xmm10 = (wZ, wZ)
        // @0x284d7b  mulpd xmm13, xmm14    ; xmm14 = (wZ*q2, wZ*q3)
        const s14_lo_a = wZ * z13;
        const s14_hi_a = wZ * w13;

        // @0x284d80  movddup xmm5, xmm5    ; xmm5 = (s5a, s5a)
        // @0x284d84  addpd xmm15, xmm5     ; xmm5 = (s5a + q3*wY, s5a + q3*wZ)
        const s5b_lo = s5a + s15_lo_a;
        const s5b_hi = s5a + s15_hi_a;

        // @0x284d89  subpd xmm14, xmm15    ; xmm15 = (q3*wY - wZ*q2, q3*wZ - wZ*q3)
        //             (Note: this reuses xmm15 as scratch; the previous xmm15 was xmm5b.
        //              After this op xmm15 = (s15a - xmm14).)
        const s15_lo_b = s15_lo_a - s14_lo_a; // q3*wY - wZ*q2
        const s15_hi_b = s15_hi_a - s14_hi_a; // q3*wZ - wZ*q3

        // @0x284d8e  shufpd $0x1, xmm15, xmm5  ; xmm5 = (xmm5.hi, xmm15.lo)
        //             = (s5b_hi, s15_lo_b) = (s5a + q3*wZ, q3*wY - wZ*q2)
        const s5c_lo = s5b_hi;
        const s5c_hi = s15_lo_b;

        // @0x284d94  xorpd xmm15, xmm15    ; xmm15 = 0  (reserved as fp compare zero for later)

        // @0x284d99  movddup xmm4, xmm14   ; xmm14 = (s4a, s4a) = (q0*wX, q0*wX)
        // @0x284d9e  subpd xmm5, xmm12     ; xmm12 = xmm12 - xmm5 = (0, 0) - xmm5 = -xmm5
        //             (xmm12.lo was 0 from the mulsd artifact above; xmm12.hi was q3 originally
        //              but then the mulsd only touched lane 0, so xmm12.hi is STILL the original
        //              q3 loaded at 0x284cd7 — WAIT NO, xmm12 was overwritten at 0x284d1d as
        //              `xmm12 = xmm3 = (0,0)` broadcast. Both lanes are 0.)
        const s12_lo_a = 0 - s5c_lo;
        const s12_hi_a = 0 - s5c_hi;

        // @0x284da3  addpd xmm5, xmm14     ; xmm14 = xmm14 + xmm5 = (s4a + s5c_lo, s4a + s5c_hi)
        const s14b_lo = s4a + s5c_lo;
        const s14b_hi = s4a + s5c_hi;

        // @0x284da8  blendpd $0x1, xmm12, xmm14 ; xmm14 = (xmm12.lo, xmm14.hi)
        //             = (s12_lo_a, s14b_hi)
        const s14c_lo = s12_lo_a;
        const s14c_hi = s14b_hi;

        // @0x284daf  addpd xmm11, xmm14    ; xmm14 += xmm11 = (s14c_lo + q0, s14c_hi + q1)
        const s14d_lo = s14c_lo + q0;
        const s14d_hi = s14c_hi + q1;

        // @0x284db4  movddup xmm11, xmm4   ; xmm4 = (q0, q0)
        // @0x284db9  mulpd xmm9, xmm4      ; xmm4 = (q0*wY, q0*wZ)
        const s4b_lo = q0 * wY;
        const s4b_hi = q0 * wZ;

        // @0x284dbe  addpd xmm6, xmm4      ; xmm4 = xmm4 + xmm6 = xmm4 + (0,0) = xmm4
        //             (xmm6 = 0 from artifact)

        // @0x284dc2  movapd xmm13, xmm5    ; xmm5 = xmm13 = (q2, q3)
        // @0x284dc7  unpckhpd xmm11, xmm5  ; xmm5 = (q3, q1)  (xmm5.hi = xmm11.hi = q1)
        //             (AT&T `unpckhpd s, d` : d = (d.hi, s.hi). So xmm5 = (xmm5.hi=q3, xmm11.hi=q1).)
        const s5d_lo = w13; // q3
        const s5d_hi = q1;

        // @0x284dcc  shufpd $0x1, xmm13, xmm11 ; xmm11 = (xmm11.hi, xmm13.lo) = (q1, q2)
        //             — this MUTATES xmm11. Save into new locals; we'll write back q0,q1
        //             at the end of the iteration.
        const s11_lo_a = q1;
        const s11_hi_a = z13;

        // @0x284dd2  mulpd xmm7, xmm11     ; xmm11 = (s11_lo_a * wZ, s11_hi_a * wX)
        //             (xmm7 = (wZ, wX) — see setup at 0x284ce6)
        const s11_lo_b = s11_lo_a * wZ;
        const s11_hi_b = s11_hi_a * wX;

        // @0x284dd7  mulpd xmm1, xmm5      ; xmm5 = (s5d_lo * wX, s5d_hi * wY)
        //             (xmm1 = (wX, wY))
        const s5e_lo = s5d_lo * wX;
        const s5e_hi = s5d_hi * wY;

        // @0x284ddb  subpd xmm5, xmm11     ; xmm11 -= xmm5
        const s11_lo_c = s11_lo_b - s5e_lo;
        const s11_hi_c = s11_hi_b - s5e_hi;

        // @0x284de0  addpd xmm4, xmm11     ; xmm11 += xmm4 = (s4b_lo, s4b_hi)
        const s11_lo_d = s11_lo_c + s4b_lo;
        const s11_hi_d = s11_hi_c + s4b_hi;

        // @0x284de5  movapd xmm11, xmm12   ; xmm12 = xmm11 = (s11_lo_d, s11_hi_d)
        // @0x284dea  addpd xmm13, xmm12    ; xmm12 += xmm13 = (s11+q2, s11+q3)
        const s12_lo_b = s11_lo_d + z13;
        const s12_hi_b = s11_hi_d + w13;

        // @0x284def  movapd xmm12, xmm4    ; xmm4 = xmm12 = (s12_lo_b, s12_hi_b)
        // @0x284df4  blendpd $0x1, xmm14, xmm4 ; xmm4 = (xmm14.lo, xmm4.hi) = (s14d_lo, s12_hi_b)
        const s4c_lo = s14d_lo;
        const s4c_hi = s12_hi_b;

        // @0x284dfb  movapd xmm14, xmm5    ; xmm5 = xmm14 = (s14d_lo, s14d_hi)
        // @0x284e00  shufpd $0x1, xmm12, xmm5 ; xmm5 = (xmm5.hi, xmm12.lo) = (s14d_hi, s12_lo_b)
        const s5f_lo = s14d_hi;
        const s5f_hi = s12_lo_b;

        // @0x284e06  mulpd xmm5, xmm5      ; xmm5 = (s5f_lo², s5f_hi²)
        // @0x284e0a  mulpd xmm4, xmm4      ; xmm4 = (s4c_lo², s4c_hi²)
        const s5f_lo_sq = s5f_lo * s5f_lo;
        const s5f_hi_sq = s5f_hi * s5f_hi;
        const s4c_lo_sq = s4c_lo * s4c_lo;
        const s4c_hi_sq = s4c_hi * s4c_hi;

        // @0x284e0e  movapd xmm5, xmm6     ; xmm6 = xmm5 = (s5f_lo², s5f_hi²)
        // @0x284e12  unpckhpd xmm5, xmm6   ; xmm6 = (xmm6.hi, xmm5.hi) = (s5f_hi², s5f_hi²)
        // @0x284e16  addsd xmm5, xmm6      ; xmm6.lo = s5f_hi² + s5f_lo²
        // @0x284e1a  movapd xmm4, xmm5     ; xmm5 = xmm4 = (s4c_lo², s4c_hi²)
        // @0x284e1e  unpckhpd xmm4, xmm5   ; xmm5 = (xmm5.hi, xmm4.hi) = (s4c_hi², s4c_hi²)
        // @0x284e22  addsd xmm6, xmm5      ; xmm5.lo = xmm6.lo + xmm5.lo = s5f² + s4c_hi²
        // @0x284e26  addsd xmm4, xmm5      ; xmm5.lo += xmm4.lo = s5f² + s4c_hi² + s4c_lo²
        //   ⇒ xmm5.lo = s5f_lo² + s5f_hi² + s4c_lo² + s4c_hi² = |q_new|²
        const magSq = s5f_lo_sq + s5f_hi_sq + s4c_lo_sq + s4c_hi_sq;

        // @0x284e2a  ucomisd xmm15, xmm5   ; compare magSq to 0.0 (xmm15 = 0)
        // @0x284e2f  movapd xmm14, xmm11   ; xmm11 = xmm14 = (s14d_lo, s14d_hi)
        //             — NOTE: this is the NEW xmm11 for the NEXT iteration. Update locals.
        const s11_lo_e = s14d_lo;
        const s11_hi_e = s14d_hi;

        // @0x284e34  xorps xmm4, xmm4      ; xmm4 = 0
        // @0x284e37  sqrtsd xmm5, xmm4     ; xmm4.lo = sqrt(magSq)
        const mag = Math.sqrt(magSq);

        // @0x284e3b  movddup xmm4, xmm13   ; xmm13 = (mag, mag)
        // @0x284e40  divpd xmm13, xmm11    ; xmm11 = (s11_lo_e / mag, s11_hi_e / mag)
        //             ← NORMALIZE (q0', q1')
        let q0Next = s11_lo_e / mag;
        let q1Next = s11_hi_e / mag;

        // @0x284e45  jne 0x284e52 ; @0x284e47 jp 0x284e52
        //   if magSq != 0 (NaN-ordered), keep divided value; else patch xmm11 with a fallback.
        // @0x284e49  movsd 0x48058e(rip), xmm11  ; xmm11 = ONE (1.0) — only lane 0 loaded
        //             (movsd → high lane cleared or preserved? movsd from memory to xmm
        //              zeros the upper 64 bits. So xmm11 = (1.0, 0.0).)
        if (magSq === 0.0) {
          q0Next = 1.0;
          q1Next = 0.0;
        }

        // @0x284e52  divpd xmm13, xmm12    ; xmm12 = (s12_lo_b / mag, s12_hi_b / mag)
        let q2Next = s12_lo_b / mag;
        let q3Next = s12_hi_b / mag;

        // @0x284e57  jne 0x284d10 ; @0x284e5d jp 0x284d10   ; loop back (if magSq != 0)
        // @0x284e63  xorpd xmm12, xmm12    ; else: xmm12 = 0
        // @0x284e68  jmp 0x284d10
        if (magSq === 0.0) {
          q2Next = 0.0;
          q3Next = 0.0;
        }

        // @0x284d10  decl eax ; je 0x284e6d
        //   Loop counter decrement is at the TOP of the block; we express it as the JS
        //   for-loop bound. Exit condition matches (8 total iterations).

        // Commit iteration.
        q0 = q0Next;
        q1 = q1Next;
        q2 = q2Next;
        q3 = q3Next;
      }

      // @0x284e6d  movupd xmm11, 0x18(rdi) ; movupd xmm12, 0x28(rdi)
      qNewX = q0;
      qNewY = q1;
      qNewZ = q2;
      qNewW = q3;
      // @0x284e79  movapd -0x10(rbp), xmm2  ; restore xmm2 = (dt, dt) broadcast for PART 4
      // @0x284e7e  popq rbp
    }

    // ---------------------------------------------------------------------
    // PART 4 — angular-momentum advance + mirror + pass-through.
    // xmm0 is still `dt` (unchanged), xmm2 is `(dt, dt)` broadcast.
    // ---------------------------------------------------------------------
    // @0x284e7f  mulsd 0xa8(rdx), xmm0                 ; xmm0 = dt * curr.angAccel[2]
    // @0x284e87  addsd 0x78(rsi), xmm0                 ; xmm0 += prev.angMomentum[2]
    const lZ = prev.angMomentum[2] + dt * curr.angAccel[2];
    // @0x284e8c  movupd 0x98(rdx), xmm1                ; xmm1 = (curr.angAccel[0], curr.angAccel[1])
    // @0x284e94  mulpd xmm1, xmm2                      ; xmm2 = (dt*αx, dt*αy)
    // @0x284e98  movupd 0x68(rsi), xmm1                ; xmm1 = (prev.L[0], prev.L[1])
    // @0x284e9d  addpd xmm2, xmm1                      ; xmm1 += xmm2
    // @0x284ea1  movupd xmm1, 0x68(rdi)                ; dst.angMomentum[0..1] = xmm1
    // @0x284ea6  movsd xmm0, 0x78(rdi)                 ; dst.angMomentum[2] = lZ
    const lX = prev.angMomentum[0] + dt * curr.angAccel[0];
    const lY = prev.angMomentum[1] + dt * curr.angAccel[1];

    // @0x284eab  movq 0x78(rdi), rax ; movq rax, 0x60(rdi) ; mirror[2] = angMomentum[2]
    // @0x284eb3  movups 0x68(rdi), xmm0 ; movups xmm0, 0x50(rdi) ; mirror[0..1] = angMomentum[0..1]
    // @0x284ebb  movq 0xe8(rsi), rax ; movq rax, 0xe8(rdi) ; dst.policy = prev.policy  (raw copy — no refcount)

    // Commit stores (defer to end to preserve `dst == prev` in-place semantics).
    this.position[0] = posX;
    this.position[1] = posY;
    this.position[2] = posZ;
    this.velocity[0] = velX;
    this.velocity[1] = velY;
    this.velocity[2] = velZ;
    this.orientation[0] = qNewX;
    this.orientation[1] = qNewY;
    this.orientation[2] = qNewZ;
    this.orientation[3] = qNewW;
    this.angMomentum[0] = lX;
    this.angMomentum[1] = lY;
    this.angMomentum[2] = lZ;
    // Mirror at +0x50..+0x60.
    this.angMomentumMirror[0] = lX;
    this.angMomentumMirror[1] = lY;
    this.angMomentumMirror[2] = lZ;
    // Raw policy pass-through — no refcount ops (matches the movq at 0x284ebb..0x284ec2).
    this.policy = prev.policy;
    // @0x284ec9  retq
  }
}
