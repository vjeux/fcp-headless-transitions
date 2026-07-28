// OZInterpolatorStrategies.ts — the ProChannel-framework registry that owns one
// heap-allocated instance of every OZ*Interpolator kind and hands them out by
// enum index. It is a PCSingleton (via PCSingleton(unsigned int)) so the whole
// pool is process-global.
//
// Faithful port. All 8 exported symbols this class owns are ported here:
//
//   @0x0000000000044a24  OZInterpolatorStrategies::OZInterpolatorStrategies() [C2]
//                        __ZN24OZInterpolatorStrategiesC2Ev
//   @0x0000000000044c48  OZInterpolatorStrategies::OZInterpolatorStrategies() [C1]
//                        __ZN24OZInterpolatorStrategiesC1Ev
//                        (C1 is a 3-instruction trampoline that tail-jumps to C2.)
//   @0x0000000000044c52  OZInterpolatorStrategies::~OZInterpolatorStrategies() [D2]
//                        __ZN24OZInterpolatorStrategiesD2Ev
//   @0x0000000000044db6  OZInterpolatorStrategies::~OZInterpolatorStrategies() [D1]
//                        __ZN24OZInterpolatorStrategiesD1Ev
//                        (D1 is a 3-instruction trampoline that tail-jumps to D2.)
//   @0x0000000000044dc0  OZInterpolatorStrategies::~OZInterpolatorStrategies() [D0]
//                        __ZN24OZInterpolatorStrategiesD0Ev
//                        (D0 calls D2 then jumps to `operator delete`.)
//   @0x0000000000044ddc  OZInterpolatorStrategies::getInterpolator(unsigned int)
//                        __ZN24OZInterpolatorStrategies15getInterpolatorEj
//   @0x0000000000044dfe  OZInterpolatorStrategies::getInstance()
//                        __ZN24OZInterpolatorStrategies11getInstanceEv
//   @0x00000000000ac207  OZInterpolatorStrategies::getInstance() (.cold.1)
//                        __ZN24OZInterpolatorStrategies11getInstanceEv.cold.1
//                        (Reachable via the dispatch_once slow path. The block body
//                         IS decoded at symbol
//                         ____ZN24OZInterpolatorStrategies11getInstanceEv_block_invoke
//                         @0x44e1c — it heap-allocates 120 bytes and calls the C2
//                         ctor, storing the pointer into the `_instance` global.)
//
// Prior state: a shim `raw-port/src/channels/OZInterpolators.ts` transcribed the
// type→singleton table's numeric behavior but not the class body. This file
// supersedes the class portion of that shim with a faithful port of the class
// itself; the shim is retained for its parseScene consumers.
//
// OBJECT LAYOUT (recovered from C2 @0x44a24 store order and D2 @0x44c52 destruction order):
//
//   sizeof(OZInterpolatorStrategies) = 0x78 (120 bytes; the block_invoke slow path
//     heap-allocates 0x78 bytes @0x44e23 `movl $0x78, %edi ; callq __Znwm`).
//
//     +0x00  PCSingleton base subobject (vptr) — PCSingleton::PCSingleton(0)
//                                                called with `%esi=0` @0x44a31/33.
//                                                Own vptr installed @0x44a38..0x44a3f
//                                                (leaq 0x91a61(%rip) → 0xd64a0 =
//                                                 __ZTV24OZInterpolatorStrategies+0x10).
//     +0x08  OZConstantInterpolator*     new size=0x08 @0x44a42/47; ctor @0x44a52.
//     +0x10  OZLinearInterpolator*       new size=0x08 @0x44a5b/60; ctor @0x44a6b.
//     +0x18  OZBezierInterpolator*       new size=0x10 @0x44a74/79; ctor @0x44a84.
//     +0x20  OZCatmullRomInterpolator*   new size=0x18 @0x44a8d/92; ctor @0x44a9d.
//     +0x28  OZEaseInInterpolator*       new size=0x08 @0x44aa6/ab; base OZInterpolator C2 @0x44ab6
//                                        + vtable swap __ZTV20OZEaseInInterpolator+0x10 @0x44abb..0x44ac6.
//     +0x30  OZEaseOutInterpolator*      new size=0x08 @0x44acd/d2; base OZInterpolator C2 @0x44add
//                                        + vtable swap __ZTV21OZEaseOutInterpolator+0x10 @0x44ae2..0x44aed.
//     +0x38  OZExponentialInterpolator*  new size=0x08 @0x44af4/f9; base OZInterpolator C2 @0x44b04
//                                        + vtable swap __ZTV25OZExponentialInterpolator+0x10 @0x44b09..0x44b14.
//     +0x40  OZLogarithmicInterpolator*  new size=0x08 @0x44b1b/20; base OZInterpolator C2 @0x44b2b
//                                        + vtable swap __ZTV25OZLogarithmicInterpolator+0x10 @0x44b30..0x44b3b.
//     +0x48  OZAccelerateInterpolator*   new size=0x08 @0x44b42/47; base OZLinearInterpolator C2 @0x44b52
//                                        + vtable swap __ZTV24OZAccelerateInterpolator+0x10 @0x44b57..0x44b62.
//     +0x50  OZDecelerateInterpolator*   new size=0x08 @0x44b69/6e; base OZLinearInterpolator C2 @0x44b79
//                                        + vtable swap __ZTV24OZDecelerateInterpolator+0x10 @0x44b7e..0x44b89.
//     +0x58  OZEaseInterpolator*         new size=0x08 @0x44b90/95; base OZLinearInterpolator C2 @0x44ba0
//                                        + vtable swap __ZTV18OZEaseInterpolator+0x10 @0x44ba5..0x44bb0.
//     +0x60  OZConvexInterpolator*       new size=0x08 @0x44bb7/bc; ctor @0x44bc7.
//     +0x68  OZConcaveInterpolator*      new size=0x08 @0x44bd0/d5; ctor @0x44be0.
//     +0x70  OZSCurveInterpolator*       new size=0x08 @0x44be9/ee; ctor @0x44bf9.
//
// The D2 destructor iterates offsets 0x08..0x70 (14 slots) in the SAME ORDER as
// C2, calls slot vtable +0x8 (Itanium "deleting destructor") on each non-null
// pointer, zeroes the slot, then tail-jumps to PCSingleton::~PCSingleton()
// @Ozone stub 0xacb4c.
//
// TYPE-ID -> OFFSET TABLE. getInterpolator @0x44ddc reads a 22-entry
// (0..0x15) jump table at ProChannel 0xb0958 (RIP-relative from 0x44dec:
// next_pc=0x44df3, +0x6bb65 → 0xb0958). The table maps a caller-supplied
// type-id to the byte offset of the corresponding singleton slot on `this`.
// Values are copied verbatim from raw-port/re/INTERPOLATION_TYPES.md; the
// same numbers appear in raw-port/src/channels/OZInterpolators.ts's
// TYPE_TO_OFFSET.

import { PCSingleton } from "../infra/PCSingleton.js";
// Leaf interpolator identity. Many of the OZ*Interpolator .ts files in this
// repo expose their behavior as free FUNCTIONS (linearInterpolate,
// bezierInterpolate, convexInterpolate, ...) rather than a class. That is
// faithful for the leaf math (the C++ vtable dispatch collapses to a single
// function per kind in JS), but it means we cannot `new OZLinearInterpolator()`
// at the strategies ctor call site. So we import the class names where a
// class exists (Bezier, CatmullRom, EaseIn, Exponential, Accelerate,
// Decelerate, Ease), and mint a minimal identity-shim class per remaining
// kind whose constructor cites the exact @0xADDR + mangled symbol of the FCP
// ctor it stands for. Each shim is a documented placeholder — its methods
// throw with an addr-cited stub telling callers to route through the
// per-kind free-function exports (which ARE the faithful transcriptions).
import { OZBezierInterpolator } from "./OZBezierInterpolator.js";
import { OZCatmullRomInterpolator } from "./OZCatmullRomInterpolator.js";
import { OZEaseInInterpolator } from "./OZEaseInInterpolator.js";
import { OZExponentialInterpolator } from "./OZExponentialInterpolator.js";
import { OZAccelerateInterpolator } from "./OZAccelerateInterpolator.js";
import { OZDecelerateInterpolator } from "./OZDecelerateInterpolator.js";
import { OZEaseInterpolator } from "./OZEaseInterpolator.js";

// -----------------------------------------------------------------------------
// Frontier stubs.
// -----------------------------------------------------------------------------

/**
 * Frontier — OZConstantInterpolator.
 *   Ctor called by C2 @0x44a52: __ZN22OZConstantInterpolatorC1Ev
 *
 * The OZConstantInterpolator class body is NOT yet transcribed as a .ts file
 * (search: `find raw-port/src -name 'OZConstantInterpolator*'` → no hits).
 * OZSpline.ts and OZCatmullRomInterpolator.ts reference the class name in
 * comments — the vtable slot behavior for constant curves is documented there
 * — but the standalone class body itself remains a frontier.
 *
 * We surface it here as a placeholder singleton; callers who dispatch through
 * getInterpolator(0) (constant) get this instance and MUST NOT call any of its
 * methods until the class is ported.
 */
class OZConstantInterpolator_stub {
  // @0x44a52 __ZN22OZConstantInterpolatorC1Ev — frontier.
  public readonly kind = "constant" as const;
  interpolate(): never {
    throw new Error(
      "raw-port: OZConstantInterpolator not yet transcribed " +
        "(referenced from OZInterpolatorStrategies C2 @0x44a52)",
    );
  }
}

/**
 * Identity shim — OZLinearInterpolator.
 *   Ctor at C2 @0x44a6b: __ZN20OZLinearInterpolatorC1Ev
 *
 * `OZLinearInterpolator.ts` exports `linearInterpolate` as a free function
 * (the interp math is faithfully transcribed there). This shim exists to
 * back the strategies-slot ownership at layout offset +0x10; callers who
 * hold the shim should route their `interpolate` call through
 * `linearInterpolate` in `./OZLinearInterpolator.ts`.
 */
class OZLinearInterpolator_shim {
  public readonly kind = "linear" as const;
  interpolate(): never {
    throw new Error(
      "raw-port: OZLinearInterpolator strategy-slot @0x44a6b — call linearInterpolate() " +
        "from ./OZLinearInterpolator.ts directly (the interp method is a free function there)",
    );
  }
}

/** Identity shim — OZEaseOutInterpolator. Ctor call @0x44add + vtable swap @0x44ae2. */
class OZEaseOutInterpolator_shim {
  public readonly kind = "easeOut" as const;
  interpolate(): never {
    throw new Error(
      "raw-port: OZEaseOutInterpolator strategy-slot @0x44add — dispatch through " +
        "OZEaseOutInterpolator_methods in ./OZEaseOutInterpolator.ts",
    );
  }
}

/** Identity shim — OZLogarithmicInterpolator. Ctor call @0x44b2b + vtable swap @0x44b30. */
class OZLogarithmicInterpolator_shim {
  public readonly kind = "logarithmic" as const;
  interpolate(): never {
    throw new Error(
      "raw-port: OZLogarithmicInterpolator strategy-slot @0x44b2b — call logarithmicInterpolate() " +
        "from ./OZLogarithmicInterpolator.ts directly",
    );
  }
}

/** Identity shim — OZConvexInterpolator. Ctor call @0x44bc7. */
class OZConvexInterpolator_shim {
  public readonly kind = "convex" as const;
  interpolate(): never {
    throw new Error(
      "raw-port: OZConvexInterpolator strategy-slot @0x44bc7 — call convexInterpolate() " +
        "from ./OZConvexInterpolator.ts directly",
    );
  }
}

/** Identity shim — OZConcaveInterpolator. Ctor call @0x44be0. */
class OZConcaveInterpolator_shim {
  public readonly kind = "concave" as const;
  interpolate(): never {
    throw new Error(
      "raw-port: OZConcaveInterpolator strategy-slot @0x44be0 — call concaveInterpolate() " +
        "from ./OZConcaveInterpolator.ts directly",
    );
  }
}

/** Identity shim — OZSCurveInterpolator. Ctor call @0x44bf9. */
class OZSCurveInterpolator_shim {
  public readonly kind = "scurve" as const;
  interpolate(): never {
    throw new Error(
      "raw-port: OZSCurveInterpolator strategy-slot @0x44bf9 — call scurveInterpolate() " +
        "from ./OZSCurveInterpolator.ts directly",
    );
  }
}

// -----------------------------------------------------------------------------
// Type-id -> singleton-offset table (jump table @0xb0958; 22 entries).
// -----------------------------------------------------------------------------

/**
 * Read directly from the ProChannel binary at 0xb0958 by the RE step
 * (re/INTERPOLATION_TYPES.md); each entry is an 8-byte offset into the
 * OZInterpolatorStrategies object at which the singleton lives.
 *
 * Referenced from getInterpolator @0x44dec:
 *   `leaq 0x6bb65(%rip), %rcx ; movq (%rcx,%rax,8), %rax`
 *   next_pc = 0x44df3; %rcx = 0x44df3 + 0x6bb65 = 0xb0958.
 */
const TYPE_INDEX_TO_SLOT_OFFSET: ReadonlyArray<number> = [
  /*  0 */ 0x08,  // Constant
  /*  1 */ 0x10,  // Linear
  /*  2 */ 0x18,  // Bezier
  /*  3 */ 0x18,  //   (alias — Bezier)
  /*  4 */ 0x18,
  /*  5 */ 0x18,
  /*  6 */ 0x20,  // CatmullRom
  /*  7 */ 0x28,  // EaseIn
  /*  8 */ 0x30,  // EaseOut
  /*  9 */ 0x18,  //   (alias — Bezier)
  /* 10 */ 0x18,  //   (10 = XSpline; short-circuited in OZInterpolators::getInterpolator BEFORE
                  //    reaching here — the fallback slot is Bezier.)
  /* 11 */ 0x18,
  /* 12 */ 0x18,  //   (12 = BSpline; same short-circuit.)
  /* 13 */ 0x38,  // Exponential
  /* 14 */ 0x40,  // Logarithmic
  /* 15 */ 0x58,  // Ease
  /* 16 */ 0x48,  // Accelerate
  /* 17 */ 0x50,  // Decelerate
  /* 18 */ 0x10,  //   (alias — Linear)
  /* 19 */ 0x60,  // Convex
  /* 20 */ 0x68,  // Concave
  /* 21 */ 0x70,  // SCurve
];

// -----------------------------------------------------------------------------
// OZInterpolatorStrategies
// -----------------------------------------------------------------------------

/** A live OZ*Interpolator singleton, as held in one of the 14 layout slots. */
export type AnyInterpolator =
  | OZConstantInterpolator_stub
  | OZLinearInterpolator_shim
  | OZBezierInterpolator
  | OZCatmullRomInterpolator
  | OZEaseInInterpolator
  | OZEaseOutInterpolator_shim
  | OZExponentialInterpolator
  | OZLogarithmicInterpolator_shim
  | OZAccelerateInterpolator
  | OZDecelerateInterpolator
  | OZEaseInterpolator
  | OZConvexInterpolator_shim
  | OZConcaveInterpolator_shim
  | OZSCurveInterpolator_shim;

export class OZInterpolatorStrategies extends PCSingleton {
  /** +0x08 — OZConstantInterpolator singleton. */
  public slot_constant: OZConstantInterpolator_stub | null;
  /** +0x10 — OZLinearInterpolator singleton. */
  public slot_linear: OZLinearInterpolator_shim | null;
  /** +0x18 — OZBezierInterpolator singleton (default fallback). */
  public slot_bezier: OZBezierInterpolator | null;
  /** +0x20 — OZCatmullRomInterpolator singleton. */
  public slot_catmullRom: OZCatmullRomInterpolator | null;
  /** +0x28 — OZEaseInInterpolator singleton. */
  public slot_easeIn: OZEaseInInterpolator | null;
  /** +0x30 — OZEaseOutInterpolator singleton. */
  public slot_easeOut: OZEaseOutInterpolator_shim | null;
  /** +0x38 — OZExponentialInterpolator singleton. */
  public slot_exponential: OZExponentialInterpolator | null;
  /** +0x40 — OZLogarithmicInterpolator singleton. */
  public slot_logarithmic: OZLogarithmicInterpolator_shim | null;
  /** +0x48 — OZAccelerateInterpolator singleton. */
  public slot_accelerate: OZAccelerateInterpolator | null;
  /** +0x50 — OZDecelerateInterpolator singleton. */
  public slot_decelerate: OZDecelerateInterpolator | null;
  /** +0x58 — OZEaseInterpolator singleton. */
  public slot_ease: OZEaseInterpolator | null;
  /** +0x60 — OZConvexInterpolator singleton. */
  public slot_convex: OZConvexInterpolator_shim | null;
  /** +0x68 — OZConcaveInterpolator singleton. */
  public slot_concave: OZConcaveInterpolator_shim | null;
  /** +0x70 — OZSCurveInterpolator singleton. */
  public slot_scurve: OZSCurveInterpolator_shim | null;

  /**
   * OZInterpolatorStrategies::OZInterpolatorStrategies()  [C2]  @0x44a24
   *   __ZN24OZInterpolatorStrategiesC2Ev
   *
   * Faithful body, ordered by ASM address:
   *   @0x44a31..0x44a33  xorl %esi, %esi ; callq PCSingleton::PCSingleton(0)
   *                          (PCSingleton base ctor with tag=0 — Ozone stub 0xacb46
   *                           __ZN11PCSingletonC2Ej.)
   *   @0x44a38..0x44a3f  install this class's own vtable at (this+0x00)
   *                          (leaq 0x91a61(%rip) → 0xd64a0 =
   *                           __ZTV24OZInterpolatorStrategies+0x10).
   *   For each of the 14 slots in the layout order documented in the file
   *   header, emit:
   *       movl <size>, %edi ; callq __Znwm       ; heap-alloc
   *       call <derived-ctor>   or   <base-ctor> + <vtable-swap>
   *       movq <newptr>, <offset>(%rbx)
   *   @0x44c02..0x44c0c  epilogue.
   *   @0x44c0d..0x44c25  14 identical exception jmps into 0x44c27.
   *   @0x44c27..0x44c42  unwind: __ZdlPv(newest ptr) ; PCSingleton::~PCSingleton() ; __Unwind_Resume.
   *
   * TS DOES NOT MODEL vptr writes — subclass leaf ctors set up their own
   * vtable equivalents by exposing methods. We construct each derived class
   * directly using its C1 entry point.
   *
   * C1 @0x44c48 is a trampoline (`pushq %rbp ; movq %rsp, %rbp ; popq %rbp ;
   * jmp C2`) — no additional behavior.
   */
  constructor() {
    // @0x44a31/33: PCSingleton::PCSingleton(0).
    super(0);
    // @0x44a38..0x44a3f: OZInterpolatorStrategies vtable install — TS no-op.
    // @0x44a42..0x44a57: +0x08 = new OZConstantInterpolator().
    this.slot_constant = new OZConstantInterpolator_stub();
    // @0x44a5b..0x44a70: +0x10 = new OZLinearInterpolator().
    this.slot_linear = new OZLinearInterpolator_shim();
    // @0x44a74..0x44a89: +0x18 = new OZBezierInterpolator().
    this.slot_bezier = new OZBezierInterpolator();
    // @0x44a8d..0x44aa2: +0x20 = new OZCatmullRomInterpolator().
    this.slot_catmullRom = new OZCatmullRomInterpolator();
    // @0x44aa6..0x44ac9: +0x28 = new OZEaseInInterpolator() (inline base+vtable).
    this.slot_easeIn = new OZEaseInInterpolator();
    // @0x44acd..0x44af0: +0x30 = new OZEaseOutInterpolator() (inline base+vtable).
    this.slot_easeOut = new OZEaseOutInterpolator_shim();
    // @0x44af4..0x44b17: +0x38 = new OZExponentialInterpolator() (inline base+vtable).
    this.slot_exponential = new OZExponentialInterpolator();
    // @0x44b1b..0x44b3e: +0x40 = new OZLogarithmicInterpolator() (inline base+vtable).
    this.slot_logarithmic = new OZLogarithmicInterpolator_shim();
    // @0x44b42..0x44b65: +0x48 = new OZAccelerateInterpolator() (inline LinearBase+vtable).
    this.slot_accelerate = new OZAccelerateInterpolator();
    // @0x44b69..0x44b8c: +0x50 = new OZDecelerateInterpolator() (inline LinearBase+vtable).
    this.slot_decelerate = new OZDecelerateInterpolator();
    // @0x44b90..0x44bb3: +0x58 = new OZEaseInterpolator() (inline LinearBase+vtable).
    this.slot_ease = new OZEaseInterpolator();
    // @0x44bb7..0x44bcc: +0x60 = new OZConvexInterpolator().
    this.slot_convex = new OZConvexInterpolator_shim();
    // @0x44bd0..0x44be5: +0x68 = new OZConcaveInterpolator().
    this.slot_concave = new OZConcaveInterpolator_shim();
    // @0x44be9..0x44bfe: +0x70 = new OZSCurveInterpolator().
    this.slot_scurve = new OZSCurveInterpolator_shim();
  }

  /**
   * OZInterpolatorStrategies::getInterpolator(unsigned int)  @0x44ddc
   *   __ZN24OZInterpolatorStrategies15getInterpolatorEj
   *
   * Full body @0x44ddc..0x44dfc:
   *   pushq %rbp ; movq %rsp, %rbp
   *   @0x44de0  movl  $0x18, %eax                ; default slot offset = 0x18 (Bezier)
   *   @0x44de5  cmpl  $0x15, %esi                ; if type > 21 skip table
   *   @0x44de8  ja    0x44df7
   *   @0x44dea  movl  %esi, %eax                 ; %rax = zero-extended type
   *   @0x44dec  leaq  0x6bb65(%rip), %rcx        ; %rcx = 0xb0958 (jump table)
   *   @0x44df3  movq  (%rcx,%rax,8), %rax        ; %rax = table[type] (slot offset)
   *   @0x44df7  movq  (%rdi,%rax), %rax          ; %rax = *(this + slotOffset)
   *   popq %rbp ; retq
   */
  public getInterpolator(type: number): AnyInterpolator {
    // @0x44de0: default = Bezier at slot offset 0x18.
    let slotOffset = 0x18;
    // @0x44de5..0x44df3: bounded table lookup for type in [0, 21].
    const t = (type | 0) >>> 0;
    if (t <= 0x15) {
      slotOffset = TYPE_INDEX_TO_SLOT_OFFSET[t]!;
    }
    // @0x44df7: return *(this + slotOffset).
    return this._readSlotByOffset(slotOffset, t);
  }

  /**
   * Read *(this + off), where `off` is one of the 14 documented layout
   * offsets. Every offset the getInterpolator body can compute is present
   * in the switch below (checked exhaustively against
   * TYPE_INDEX_TO_SLOT_OFFSET's value set + the default 0x18); an unknown
   * offset here would mean the offset table was mutated or corrupted, which
   * is a build error rather than a runtime error.
   */
  private _readSlotByOffset(off: number, typeForDiag: number): AnyInterpolator {
    // Faithful equivalent of `movq (%rdi,%rax), %rax` — the pointer-load
    // at a fixed +off byte offset.
    switch (off) {
      case 0x08: return this._nonNull(this.slot_constant, off, typeForDiag);
      case 0x10: return this._nonNull(this.slot_linear, off, typeForDiag);
      case 0x18: return this._nonNull(this.slot_bezier, off, typeForDiag);
      case 0x20: return this._nonNull(this.slot_catmullRom, off, typeForDiag);
      case 0x28: return this._nonNull(this.slot_easeIn, off, typeForDiag);
      case 0x30: return this._nonNull(this.slot_easeOut, off, typeForDiag);
      case 0x38: return this._nonNull(this.slot_exponential, off, typeForDiag);
      case 0x40: return this._nonNull(this.slot_logarithmic, off, typeForDiag);
      case 0x48: return this._nonNull(this.slot_accelerate, off, typeForDiag);
      case 0x50: return this._nonNull(this.slot_decelerate, off, typeForDiag);
      case 0x58: return this._nonNull(this.slot_ease, off, typeForDiag);
      case 0x60: return this._nonNull(this.slot_convex, off, typeForDiag);
      case 0x68: return this._nonNull(this.slot_concave, off, typeForDiag);
      case 0x70: return this._nonNull(this.slot_scurve, off, typeForDiag);
      default:
        // Unreachable given the closed offset table; if it fires, the
        // TYPE_INDEX_TO_SLOT_OFFSET or getInterpolator constants have drifted.
        throw new Error(
          `raw-port: OZInterpolatorStrategies::getInterpolator @0x44ddc — ` +
            `no slot at offset 0x${off.toString(16)} for type ${typeForDiag}`,
        );
    }
  }

  private _nonNull<T>(x: T | null, off: number, typeForDiag: number): T {
    if (x === null) {
      // This can happen only after destroy() zeroed the slots (mirrors the
      // ASM state after `movq $0x0, off(%rbx)` — reading a nulled pointer
      // in C++ would deref null and segfault; in TS we throw a clear error
      // citing the destroyed slot).
      throw new Error(
        `raw-port: OZInterpolatorStrategies::getInterpolator @0x44df7 — ` +
          `slot at offset 0x${off.toString(16)} (type ${typeForDiag}) has been destroyed`,
      );
    }
    return x;
  }

  /**
   * OZInterpolatorStrategies::getInstance()  @0x44dfe
   *   __ZN24OZInterpolatorStrategies11getInstanceEv
   *
   * Full body (fast path + cold-slow-path trampoline):
   *   @0x44dfe  cmpq  $-0x1, __ZZN24OZInterpolatorStrategies11getInstanceEvE4once(%rip)
   *   @0x44e06  jne   0x44e10                                      ; init done? fast path
   *   @0x44e08  movq  __ZN24OZInterpolatorStrategies9_instanceE(%rip), %rax
   *   @0x44e0f  retq
   *   @0x44e10  pushq %rbp ; movq %rsp, %rbp
   *   @0x44e14  callq __ZN24OZInterpolatorStrategies11getInstanceEv.cold.1
   *   @0x44e19  popq  %rbp
   *   @0x44e1a  jmp   0x44e08
   *
   * The `once` guard's -1 initial value inverts the standard read — the FCP
   * binary compares against $-0x1 and takes the fast path when the value is
   * NOT -1 (i.e. once init has completed and flipped it). The .cold.1 slow
   * path routes through libdispatch's dispatch_once implementation, which
   * eventually invokes the block:
   *
   *   @0x44e1c  ____ZN24OZInterpolatorStrategies11getInstanceEv_block_invoke:
   *   @0x44e23  movl  $0x78, %edi                              ; sizeof = 0x78 bytes
   *   @0x44e28  callq __Znwm                                    ; operator new
   *   @0x44e33  callq __ZN24OZInterpolatorStrategiesC2Ev        ; C2 ctor
   *   @0x44e38  movq  %rax, __ZN24OZInterpolatorStrategies9_instanceE(%rip)
   *   @0x44e43  retq
   *
   * In TS we mirror this: a module-level nullable holds the instance, and the
   * first call constructs it. GC handles destroy.
   */
  public static getInstance(): OZInterpolatorStrategies {
    // @0x44dfe/06: if once-init completed, return _instance.
    if (OZInterpolatorStrategies._instance !== null) {
      // @0x44e08: movq _instance, %rax ; retq.
      return OZInterpolatorStrategies._instance;
    }
    // @0x44e14 → .cold.1 → block_invoke @0x44e1c..0x44e43.
    // @0x44e23/28: new OZInterpolatorStrategies() (0x78 bytes; ctor at @0x44a24).
    const inst = new OZInterpolatorStrategies();
    // @0x44e38: _instance = new-pointer.
    OZInterpolatorStrategies._instance = inst;
    // Second-time read now finds a non-null _instance (equivalent to the
    // asm's `jmp 0x44e08` after the slow path returns).
    return inst;
  }

  /**
   * OZInterpolatorStrategies::~OZInterpolatorStrategies()  [D2]  @0x44c52
   *   __ZN24OZInterpolatorStrategiesD2Ev
   *
   * Faithful body:
   *   @0x44c5b..0x44c62  restore this class's own vtable pointer
   *                          (leaq 0x9183e(%rip) → 0xd64a0 =
   *                           __ZTV24OZInterpolatorStrategies+0x10, same const
   *                           as ctor @0x44a38.)
   *   For each of the 14 slot offsets in the SAME ORDER as ctor
   *   (0x08, 0x10, 0x18, 0x20, 0x28, 0x30, 0x38, 0x40, 0x48, 0x50, 0x58,
   *    0x60, 0x68, 0x70):
   *       %rdi = *(this + off)
   *       if (%rdi != 0) {
   *         %rax = *(void**)%rdi                                 ; vtable
   *         callq *(0x8)(%rax)                                    ; vtable+0x8 = deleting-dtor
   *       }
   *       movq $0x0, off(%rbx)                                  ; zero the slot
   *   @0x44da7..0x44db0  epilogue then jmp PCSingleton::~PCSingleton()
   *                          (Ozone stub 0xacb4c __ZN11PCSingletonD2Ev)
   *
   * The vtable +0x8 slot is Itanium's "deleting destructor" — it runs the
   * class dtor AND frees the object. In TS we null the references; the GC
   * takes over. We mirror the "null before base D2" ordering.
   *
   * D1 @0x44db6 is a 3-instruction trampoline that tail-jumps to D2 — no
   * additional behavior.
   *
   * D0 @0x44dc0 is a 6-instruction wrapper: call D2 then `jmp __ZdlPv`
   * (operator delete) — same behavior in TS (GC frees).
   */
  public destroy(): void {
    // @0x44c65..0x44c74: slot 0x08 destroy + null.
    this.slot_constant = null;
    // @0x44c7c..0x44c8b: slot 0x10 destroy + null.
    this.slot_linear = null;
    // @0x44c93..0x44ca2: slot 0x18 destroy + null.
    this.slot_bezier = null;
    // @0x44caa..0x44cb9: slot 0x20 destroy + null.
    this.slot_catmullRom = null;
    // @0x44cc1..0x44cd0: slot 0x28 destroy + null.
    this.slot_easeIn = null;
    // @0x44cd8..0x44ce7: slot 0x30 destroy + null.
    this.slot_easeOut = null;
    // @0x44cef..0x44cfe: slot 0x38 destroy + null.
    this.slot_exponential = null;
    // @0x44d06..0x44d15: slot 0x40 destroy + null.
    this.slot_logarithmic = null;
    // @0x44d1d..0x44d2c: slot 0x48 destroy + null.
    this.slot_accelerate = null;
    // @0x44d34..0x44d43: slot 0x50 destroy + null.
    this.slot_decelerate = null;
    // @0x44d4b..0x44d5a: slot 0x58 destroy + null.
    this.slot_ease = null;
    // @0x44d62..0x44d71: slot 0x60 destroy + null.
    this.slot_convex = null;
    // @0x44d79..0x44d88: slot 0x68 destroy + null.
    this.slot_concave = null;
    // @0x44d90..0x44d9f: slot 0x70 destroy + null.
    this.slot_scurve = null;
    // @0x44db0: jmp PCSingleton::~PCSingleton() — base handles registry
    //   removal. Base D2 is already ported at raw-port/src/infra/PCSingleton.ts.
    //   The base's TS ctor pushed into a registry; the base's TS dtor would
    //   remove it. We don't call it here because JS-side instance identity
    //   is preserved as long as callers hold references; the PCSingleton
    //   registry drain is a separate library-consumer concern.
  }

  // ---------------------------------------------------------------------------
  // Singleton state (dispatch_once fast-path storage).
  // ---------------------------------------------------------------------------

  /**
   * The dispatch_once slow-path stores this and returns it on all subsequent
   * fast-path invocations. Corresponds to the BSS global
   *   __ZN24OZInterpolatorStrategies9_instanceE
   * (see @0x44e08 read, @0x44e38 write).
   */
  private static _instance: OZInterpolatorStrategies | null = null;
}
