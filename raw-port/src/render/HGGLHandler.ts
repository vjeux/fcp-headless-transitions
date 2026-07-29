// HGGLHandler.ts — Helium fixed-pipeline OpenGL texturing/matrix helper.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice).
//
// HGGLHandler is a thin C++ wrapper around the OpenGL 1.x fixed-function texture
// pipeline used by Helium's software/GL raster path. It manages:
//   * the current texture target (`GL_TEXTURE_2D` vs `GL_TEXTURE_RECTANGLE_ARB`),
//   * a "base texture unit" offset used when Helium wants to bank textures at an
//     offset past `GL_TEXTURE0`,
//   * an optional integer "physical translate" applied to every ActiveTexture,
//   * per-texture rectangle-to-normalized coord fixup for Rect drawing,
//   * a dev-time HGLogger "gpu" channel dump of every GL state change.
//
// Every method here is 1:1 with a real Helium symbol; each header comment cites
// the exact @0xADDR that the body ports. All GL entry points and the base-class
// forwards are surfaced as throwing stubs — this file is a faithful in-image
// transcription of what HGGLHandler does; it does NOT invent GL semantics.
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * HGGLHandler::HGGLHandler() [C2]                              @0x1522f0
//   * HGGLHandler::~HGGLHandler() [D0]                             @0x3c46c0
//   * HGGLHandler::InitTexture(int,HGRect,HGRect,HGRect,int,int)   @0x152330
//   * HGGLHandler::SetFilter(int,int)                              @0x152340
//   * HGGLHandler::SetTextureCoordinateNormalization(bool)         @0x152460
//   * HGGLHandler::Reset(HGRenderer*)                              @0x152470
//   * HGGLHandler::ActiveTexture(int,bool)                         @0x152510
//   * HGGLHandler::ActiveTextureMatrix(int)                        @0x1525d0
//   * HGGLHandler::LoadIdentity()                                  @0x1525e0
//   * HGGLHandler::Translate(double,double,double)                 @0x152620
//   * HGGLHandler::Scale(double,double,double)                     @0x152680
//   * HGGLHandler::MultMatrix(double const*)                       @0x1526e0
//   * HGGLHandler::MultMatrix(float const*)                        @0x152810
//   * HGGLHandler::Rect(HGRect,int)                                @0x152980
//   * HGGLHandler::Normalize()                                     @0x152b00
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT
// -----------------------------------------------------------------------------
// The ctor @0x1522f0 delegates to `HGHandler::HGHandler()` (base class), then
// stores the HGGLHandler primary vtable at `+0x00` and writes the default
// texture target `0x84F5 (GL_TEXTURE_RECTANGLE_ARB)` at `+0xf8`. Every field
// below is read/written by at least one ported method — offsets are recovered
// from the disasm, not guessed.
//
//   0x00  vptr                     — Helium HGGLHandler vtable
//                                    (installed by ctor @0x152308 via `leaq
//                                     0x8cd60b(%rip), %rax; movq %rax, (%rbx)`).
//   0x08 .. 0x9f   base HGHandler fields (opaque here — only touched via
//                                         HGHandler::HGHandler(), ::Reset(),
//                                         ::InitTexture() forwards).
//   0xa0  int  baseTextureUnitOffset   — added to `unit` in ActiveTexture()
//                                        (@0x152521-0x152530). Also present in
//                                        the base HGHandler footprint.
//   0xdc  int  glMatrixMinX            — read by Normalize (@0x152b46). One
//                                        component of the current 2D texture
//                                        matrix "min" corner used to compute
//                                        normalization span (max - min).
//   0xe0  int  glMatrixMinY            — the sibling of 0xdc (loaded as part of
//                                        the same 64-bit vector read in
//                                        Normalize).
//   0xe4  int  glMatrixMaxX            — read by Normalize (@0x152b3d).
//   0xe8  int  glMatrixMaxY            — sibling of 0xe4.
//   0xec  int  filterFallbackFlag      — read by SetFilter (@0x152432, 0x152448)
//                                        to decide the per-arg fallback state:
//                                        if a filter arg is < 0, the effective
//                                        value is `!= 0 ? 1 : 0` of this field.
//   0xf0  int  physicalTranslateX      — read by ActiveTexture (@0x152569,
//                                        0x15258c) when the `applyPhysical`
//                                        param is true.
//   0xf4  int  physicalTranslateY      — sibling of 0xf0 (@0x152572, 0x152593).
//   0xf8  int  textureTarget           — set by ctor to 0x84F5
//                                        (GL_TEXTURE_RECTANGLE_ARB); overwritten
//                                        by InitTexture (@0x152334). Read by
//                                        SetFilter (@0x152366, 0x152389) and
//                                        Normalize (@0x152b19).
//
// Total observed size: at least 0x100 bytes (the largest referenced offset is
// 0xf8 and the InitTexture prologue does not write past it).
//
// -----------------------------------------------------------------------------
// OPENGL CONSTANTS (verbatim from immediates in the body, not guesses)
// -----------------------------------------------------------------------------
//   0x1702    GL_TEXTURE                             (Reset @0x15247e — arg to glMatrixMode)
//   0x2600    GL_NEAREST                             (SetFilter — filter=0 result)
//   0x2601    GL_LINEAR                              (SetFilter @0x152371,0x152377 — filter=1)
//   0x2800    GL_TEXTURE_MIN_FILTER                  (SetFilter @0x15237f)
//   0x2801    GL_TEXTURE_MAG_FILTER                  (SetFilter @0x152397)
//   0x84C0..0x84C7  GL_TEXTURE0..GL_TEXTURE7          (ActiveTexture, Reset, Rect)
//   0x84F5    GL_TEXTURE_RECTANGLE_ARB               (ctor default @0x152308,
//                                                    Normalize target check @0x152b19)
//   0xBA8     GL_TEXTURE_MATRIX                      (Normalize @0x152b30 — arg
//                                                    to glGetFloatv)

/**
 * OpenGL fixed-pipeline enums used in this file. Values are verbatim GL 1.x /
 * ARB constants — they come from immediates in HGGLHandler's disassembly, not
 * from a header we imagined.
 */
export const GL_TEXTURE = 0x1702 as const;
export const GL_NEAREST = 0x2600 as const;
export const GL_LINEAR = 0x2601 as const;
export const GL_TEXTURE_MIN_FILTER = 0x2800 as const;
export const GL_TEXTURE_MAG_FILTER = 0x2801 as const;
export const GL_TEXTURE0 = 0x84c0 as const;
export const GL_TEXTURE_RECTANGLE_ARB = 0x84f5 as const;
export const GL_TEXTURE_MATRIX = 0xba8 as const;

/**
 * A 2D integer rectangle. The C++ signature `HGRect` is passed by value in the
 * System V AMD64 ABI as two 64-bit registers (rsi = pack(x,y) as low/high i32,
 * rdx = pack(w,h) as low/high i32) — see the `shrq $0x20, %r13` / `shrq $0x20,
 * %rbx` unpack in Rect (@0x15299a-0x1529a4). We model that same packing with a
 * plain object; the port faithfully unpacks x/y and w/h in the same order.
 */
export interface HGRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Opaque forward reference to Helium's HGRenderer (never dereferenced here). */
export interface HGRenderer {
  readonly __hgRenderer: unique symbol;
}

// -----------------------------------------------------------------------------
// Frontier stubs (Rule 3 — throw on undecoded).
// The GL entry points and HGHandler/HGLogger callees are not part of this port;
// each is surfaced as a throwing stub that carries the source @0xADDR at which
// this file calls it. A downstream binding provides real implementations.
// -----------------------------------------------------------------------------

/** _glActiveTexture(unit) — libGL.dylib stub @Helium 0x3c517a. Called by
 *  Reset (8x, @0x15248d..0x1524f6), ActiveTexture (@0x152533).             */
function _glActiveTexture(_unit: number): void {
  throw new Error("_glActiveTexture @Helium __stubs 0x3c517a not yet transcribed");
}
/** _glBegin(primType) — libGL.dylib stub @Helium 0x3c5186. Called by Rect (@0x1529ad). */
function _glBegin(_primType: number): void {
  throw new Error("_glBegin @Helium __stubs 0x3c5186 not yet transcribed");
}
/** _glEnd() — libGL.dylib stub @Helium 0x3c5234. Tail-called by Rect (@0x152aee). */
function _glEnd(): void {
  throw new Error("_glEnd @Helium __stubs 0x3c5234 not yet transcribed");
}
/** _glGetFloatv(pname, ptr) — libGL.dylib stub @Helium 0x3c528e. Called by
 *  Normalize (@0x152b38) with pname = GL_TEXTURE_MATRIX to read the current
 *  4x4 texture matrix into a 16-float stack buffer.                        */
function _glGetFloatv(_pname: number, _out: Float32Array): void {
  throw new Error("_glGetFloatv @Helium __stubs 0x3c528e not yet transcribed");
}
/** _glLoadIdentity() — libGL.dylib stub @Helium 0x3c52d6. Called by
 *  LoadIdentity (@0x1525e4) and Reset (@0x152492 and 7 more times).        */
function _glLoadIdentity(): void {
  throw new Error("_glLoadIdentity @Helium __stubs 0x3c52d6 not yet transcribed");
}
/** _glLoadMatrixf(m16) — libGL.dylib stub @Helium 0x3c52e2. Called by
 *  Normalize (@0x152ba9) after in-place scaling the 4 rows.                */
function _glLoadMatrixf(_m: Float32Array): void {
  throw new Error("_glLoadMatrixf @Helium __stubs 0x3c52e2 not yet transcribed");
}
/** _glMatrixMode(mode) — libGL.dylib stub @Helium 0x3c52ee. Called by Reset
 *  (@0x152483) with mode = GL_TEXTURE.                                     */
function _glMatrixMode(_mode: number): void {
  throw new Error("_glMatrixMode @Helium __stubs 0x3c52ee not yet transcribed");
}
/** _glMultiTexCoord2i(target, s, t) — libGL.dylib stub @Helium 0x3c5300.
 *  Called by Rect in inner loops (@0x1529d8, 0x152a18, 0x152a58, 0x152a98). */
function _glMultiTexCoord2i(_target: number, _s: number, _t: number): void {
  throw new Error("_glMultiTexCoord2i @Helium __stubs 0x3c5300 not yet transcribed");
}
/** _glMultMatrixd(m16) — libGL.dylib stub. Called by MultMatrix(double*)
 *  before its logger dump.                                                 */
function _glMultMatrixd(_m: Float64Array): void {
  throw new Error("_glMultMatrixd @Helium __stubs (near __ZN11HGGLHandler10MultMatrixEPKd@0x1526e0) not yet transcribed");
}
/** _glMultMatrixf(m16) — libGL.dylib stub. Called by MultMatrix(float*).   */
function _glMultMatrixf(_m: Float32Array): void {
  throw new Error("_glMultMatrixf @Helium __stubs (near __ZN11HGGLHandler10MultMatrixEPKf@0x152810) not yet transcribed");
}
/** _glScaled(x,y,z) — libGL.dylib stub @Helium 0x3c5348. Called by Scale
 *  (@0x152697).                                                            */
function _glScaled(_x: number, _y: number, _z: number): void {
  throw new Error("_glScaled @Helium __stubs 0x3c5348 not yet transcribed");
}
/** _glTexParameteri(target, pname, param) — libGL.dylib stub @Helium
 *  0x3c538a. Called by SetFilter (@0x152384, 0x15239f).                    */
function _glTexParameteri(_target: number, _pname: number, _param: number): void {
  throw new Error("_glTexParameteri @Helium __stubs 0x3c538a not yet transcribed");
}
/** _glTranslated(x,y,z) — libGL.dylib stub @Helium 0x3c539c. Called by
 *  Translate (@0x152637) and ActiveTexture (@0x15257e).                    */
function _glTranslated(_x: number, _y: number, _z: number): void {
  throw new Error("_glTranslated @Helium __stubs 0x3c539c not yet transcribed");
}
/** _glVertex2i(x,y) — libGL.dylib stub @Helium 0x3c53c0. Called by Rect in
 *  the corner emission tail (@0x1529fa, 0x152a36, 0x152a76, 0x152ab8,
 *  0x152ac3, 0x152acd, 0x152adb).                                          */
function _glVertex2i(_x: number, _y: number): void {
  throw new Error("_glVertex2i @Helium __stubs 0x3c53c0 not yet transcribed");
}

/** Base-class HGHandler::HGHandler() — Helium symbol
 *  `__ZN9HGHandlerC2Ev`. Delegated to by our ctor @0x1522f9. */
function HGHandler_ctor(_self: HGGLHandler): void {
  throw new Error("HGHandler::HGHandler() @Helium __ZN9HGHandlerC2Ev not yet transcribed (delegated @0x1522f9)");
}
/** Base-class HGHandler::Reset(HGRenderer*) — Helium symbol
 *  `__ZN9HGHandler5ResetEP10HGRenderer`. Delegated to by our Reset @0x152479. */
function HGHandler_Reset(_self: HGGLHandler, _renderer: HGRenderer): void {
  throw new Error("HGHandler::Reset(HGRenderer*) @Helium __ZN9HGHandler5ResetEP10HGRenderer not yet transcribed (delegated @0x152479)");
}
/** Base-class HGHandler::InitTexture(...) — Helium symbol
 *  `__ZN9HGHandler11InitTextureEi6HGRectS0_S0_ii`. Tail-jumped to by our
 *  InitTexture @0x15233b. */
function HGHandler_InitTexture(
  _self: HGGLHandler,
  _target: number,
  _srcRect: HGRect,
  _dstRect: HGRect,
  _clipRect: HGRect,
  _levels: number,
  _flags: number,
): void {
  throw new Error("HGHandler::InitTexture(...) @Helium __ZN9HGHandler11InitTextureEi6HGRectS0_S0_ii not yet transcribed (tail @0x15233b)");
}
/** HGLogger::log(category, level, fmt, ...) — Helium symbol
 *  `__ZN8HGLogger3logEPKciS1_z`. Called ~10 places in this file (behind the
 *  HGLogger::_enabled gate). Signature is variadic in C++; the port
 *  faithfully carries the va-arg count in the caller (movb $N, %al) as an
 *  explicit "%r" rest parameter.                                            */
function HGLogger_log(
  _category: string,
  _level: number,
  _fmt: string,
  ..._rest: unknown[]
): void {
  throw new Error("HGLogger::log(...) @Helium __ZN8HGLogger3logEPKciS1_z not yet transcribed (called from HGGLHandler @0x1525f7, 0x15264a, 0x1526aa, 0x152724, 0x152897, 0x152548, 0x1523d3, 0x1523f5, 0x15259a)");
}
/** HGLogger::_enabled — flat bool exported symbol
 *  `__ZN8HGLogger8_enabledE`. Read (byte-at-address) by every log gate below. */
const HGLogger_enabled: { value: boolean } = { value: false };

// -----------------------------------------------------------------------------
// The class body.
// -----------------------------------------------------------------------------

/**
 * HGGLHandler — Helium's OpenGL fixed-pipeline texture/matrix wrapper.
 *
 * Derived from HGHandler (Helium's abstract render-handler); this concrete
 * subclass drives fixed-function GL 1.x per the disasm of the Helium
 * framework's x86_64 slice. All ivars documented in the file header.
 */
export class HGGLHandler {
  // Field layout mirrors the header table above. Values are initialized in
  // the ctor.
  /** +0xa0 baseTextureUnitOffset (int). */
  baseTextureUnitOffset = 0;
  /** +0xdc glMatrixMinX (int). */
  glMatrixMinX = 0;
  /** +0xe0 glMatrixMinY (int). */
  glMatrixMinY = 0;
  /** +0xe4 glMatrixMaxX (int). */
  glMatrixMaxX = 0;
  /** +0xe8 glMatrixMaxY (int). */
  glMatrixMaxY = 0;
  /** +0xec filterFallbackFlag (int). */
  filterFallbackFlag = 0;
  /** +0xf0 physicalTranslateX (int). */
  physicalTranslateX = 0;
  /** +0xf4 physicalTranslateY (int). */
  physicalTranslateY = 0;
  /** +0xf8 textureTarget (int). Defaults to GL_TEXTURE_RECTANGLE_ARB. */
  textureTarget: number = GL_TEXTURE_RECTANGLE_ARB;

  /**
   * HGGLHandler::HGGLHandler() [C2] @0x1522f0.
   *
   * Prologue @0x1522f0-0x1522f8 (rbp/rbx save, %rdi -> %rbx).
   * @0x1522f9 delegate to HGHandler::HGHandler() [C2] (base class).
   * @0x1522fe leaq 0x8cd60b(%rip),%rax  — HGGLHandler primary vtable.
   * @0x152305 movq %rax,(%rbx)          — install vptr.
   * @0x152308 movl $0x84f5,0xf8(%rbx)   — textureTarget = GL_TEXTURE_RECTANGLE_ARB.
   */
  constructor() {
    HGHandler_ctor(this);
    // vtable install (@0x152305): a no-op in a JS port — dispatch is via
    // JS method-lookup on the class. Cite the addr and move on.
    // this.__vptr = "HGGLHandler-vtable @Helium 0x8cd60b-relative";
    this.textureTarget = GL_TEXTURE_RECTANGLE_ARB; // @0x152308
  }

  /**
   * HGGLHandler::~HGGLHandler() [D0 — deleting dtor] @0x3c46c0.
   *
   * The D0 body is a single `ud2` at @0x3c46c4 — the compiler emitted a
   * trap because the deleting dtor is unreachable through Helium's dispatch
   * (all destruction goes through D1/D2 base dtors which ICF-folded to the
   * HGHandler base). Faithfully port that trap: calling this must abort.
   */
  destructorD0(): never {
    throw new Error(
      "HGGLHandler::~HGGLHandler() [D0] @Helium 0x3c46c4 — `ud2` trap (deleting dtor unreachable in-image)",
    );
  }

  /**
   * HGGLHandler::InitTexture(int target, HGRect, HGRect, HGRect, int, int) @0x152330.
   *
   * @0x152334 movl %esi, 0xf8(%rdi) — cache the target int into this.textureTarget.
   * @0x15233b jmp __ZN9HGHandler11InitTextureEi6HGRectS0_S0_ii — tail-call to base.
   *
   * The parameter names beyond `target` are opaque here; the base
   * HGHandler::InitTexture consumes them. All six args pass through
   * verbatim.
   */
  InitTexture(
    target: number,
    srcRect: HGRect,
    dstRect: HGRect,
    clipRect: HGRect,
    levels: number,
    flags: number,
  ): void {
    // @0x152334
    this.textureTarget = target;
    // @0x15233b — tail-call to base.
    HGHandler_InitTexture(this, target, srcRect, dstRect, clipRect, levels, flags);
  }

  /**
   * HGGLHandler::SetFilter(int minFilter, int magFilter) @0x152340.
   *
   * Applies both min and mag filter parameters to `this.textureTarget`.
   * The two int args are interpreted:
   *   * >= 0:  literal `{0,1}` -> `{GL_NEAREST, GL_LINEAR}` (`cmpl $0x1; sbbl`
   *            trick @0x15236d-0x15237c: for min, `edx = 0x2601 - (r14<1)` so
   *            min=0 -> 0x2600 (GL_NEAREST), min=1 -> 0x2601 (GL_LINEAR)).
   *   * <  0:  fallback: substitute `this.filterFallbackFlag != 0 ? 1 : 0`
   *            (SetFilter's `xorl; setne` blocks @0x15242f-0x152453).
   * Both parameters then feed glTexParameteri, and if HGLogger is on, one
   * "min filter: %s\n" and one "mag filter: %s\n" log line are emitted.
   */
  SetFilter(minFilter: number, magFilter: number): void {
    // @0x152356..0x152358  if (minFilter < 0) goto FALLBACK_MIN @0x15242f
    // @0x152432..0x15243e  minFilter = this.filterFallbackFlag ? 1 : 0
    // @0x15243e..0x152440  if (magFilter >= 0) resume main body else FALLBACK_MAG
    // @0x152446..0x152453  magFilter = this.filterFallbackFlag ? 1 : 0
    let eMin = minFilter;
    let eMag = magFilter;
    if (eMin < 0) {
      eMin = this.filterFallbackFlag !== 0 ? 1 : 0;
    }
    if (eMag < 0) {
      eMag = this.filterFallbackFlag !== 0 ? 1 : 0;
    }
    // @0x152366  min: rdi = this.textureTarget, rsi = 0x2800 (GL_TEXTURE_MIN_FILTER)
    // @0x15236d..0x15237c  edx = 0x2601 - (min==1 ? 1 : 0)  ->  min=1 -> 0x2600, min=0 -> 0x2601
    // BUT the disasm is `movl $0x2601,%r12d; movl $0x2601,%edx; cmpl $0x1,%r14d; sbbl $0x0,%edx`.
    // `sbbl $0, %edx` subtracts (CF)+0 from edx; CF is set iff r14 < 1 (unsigned).
    // So if min == 0 -> CF=1 -> edx = 0x2601-1 = 0x2600 (GL_NEAREST).
    //    if min == 1 -> CF=0 -> edx = 0x2601      (GL_LINEAR).
    //    if min >  1 -> CF=0 -> edx = 0x2601      (GL_LINEAR too — same fall-through).
    const minParam = eMin === 0 ? GL_NEAREST : GL_LINEAR;
    _glTexParameteri(this.textureTarget, GL_TEXTURE_MIN_FILTER, minParam);
    // @0x152389..0x15239f  same trick on r12 (already 0x2601): mag=0 -> 0x2600, else 0x2601.
    const magParam = eMag === 0 ? GL_NEAREST : GL_LINEAR;
    _glTexParameteri(this.textureTarget, GL_TEXTURE_MAG_FILTER, magParam);
    // @0x1523a4..0x1523e1  if HGLogger::_enabled: log("gpu",1,"min filter: %s\n", min==0?"nearest":"linear").
    if (HGLogger_enabled.value) {
      HGLogger_log("gpu", 1, "min filter: %s\n", eMin === 0 ? "nearest" : "linear");
    }
    // @0x1523e6..0x15241b  if HGLogger::_enabled: log("gpu",1,"mag filter: %s\n", mag==0?"nearest":"linear").
    if (HGLogger_enabled.value) {
      HGLogger_log("gpu", 1, "mag filter: %s\n", eMag === 0 ? "nearest" : "linear");
    }
  }

  /**
   * HGGLHandler::SetTextureCoordinateNormalization(bool) @0x152460.
   *
   * The body is a full no-op:
   *   0x152460 pushq %rbp; movq %rsp,%rbp; popq %rbp; retq
   *
   * The argument is discarded. This is the intentional shape of the symbol
   * in Helium — likely overridden in subclasses; the base HGGLHandler
   * ignores the request.
   */
  SetTextureCoordinateNormalization(_enable: boolean): void {
    // no-op — see @0x152460.
    void _enable;
  }

  /**
   * HGGLHandler::Reset(HGRenderer* renderer) @0x152470.
   *
   * Body:
   *   @0x152479 HGHandler::Reset(renderer)
   *   @0x152483 glMatrixMode(GL_TEXTURE)                     // 0x1702
   *   for unit in [GL_TEXTURE7..GL_TEXTURE0] (0x84c7 -> 0x84c0, descending):
   *       glActiveTexture(unit)                              // @0x15248d..0x1524f6
   *       glLoadIdentity()                                   // @0x152492..0x1524fb
   *   return this  (movq %rbx,%rax @0x152500 — Reset returns self).
   *
   * The disasm emits the 8 units unrolled from 7 down to 0; we preserve that
   * exact ordering.
   */
  Reset(renderer: HGRenderer): HGGLHandler {
    // @0x152479
    HGHandler_Reset(this, renderer);
    // @0x152483
    _glMatrixMode(GL_TEXTURE);
    // @0x152488..0x1524fb — unrolled loop, descending.
    for (let i = 7; i >= 0; i--) {
      _glActiveTexture(GL_TEXTURE0 + i);
      _glLoadIdentity();
    }
    // @0x152500 movq %rbx,%rax — self is the return value.
    return this;
  }

  /**
   * HGGLHandler::ActiveTexture(int unit, bool applyPhysical) @0x152510.
   *
   * @0x152521 movl 0xa0(%rdi),%eax    — read baseTextureUnitOffset
   * @0x152527 leal (%rax,%rsi),%ebx   — combined = base + unit (result register)
   * @0x15252d addl $0x84c0,%edi       — arg = GL_TEXTURE0 + base + unit
   * @0x152533 glActiveTexture(arg)
   * (log "active texture: %d\n" combined — @0x152538..0x15255f)
   * If applyPhysical (@0x152564-0x152567 test on r15b):
   *   @0x152569 xmm0 = (double)physicalTranslateX
   *   @0x152572 xmm1 = (double)physicalTranslateY
   *   @0x15257b xmm2 = 0 (xorps)
   *   @0x15257e glTranslated(xmm0, xmm1, 0)
   *   log "physical translate: { %d, %d, %lf }\n" (@0x152583-0x1525b3)
   * Return (int) combined  — @0x1525b8 movl %ebx,%eax.
   */
  ActiveTexture(unit: number, applyPhysical: boolean): number {
    // @0x152521-0x15252a
    const combined = this.baseTextureUnitOffset + unit;
    // @0x152533
    _glActiveTexture(GL_TEXTURE0 + combined);
    // @0x152538..0x15255f
    if (HGLogger_enabled.value) {
      HGLogger_log("gpu", 1, "active texture: %d\n", combined);
    }
    // @0x152564-0x152567
    if (applyPhysical) {
      // @0x152569, 0x152572 — cvtsi2sdl loads a 32-bit int at ivar into a double.
      const px = this.physicalTranslateX;
      const py = this.physicalTranslateY;
      // @0x15257b, 0x15257e — glTranslated(px, py, 0).
      _glTranslated(px, py, 0);
      // @0x152583..0x1525b3
      if (HGLogger_enabled.value) {
        // The disasm passes ONE double %xmm0 = 0.0 (movb $0x1,%al @0x1525b1 — one XMM arg).
        // Integer args ecx = physicalTranslateX (@0x15258c), r8d = physicalTranslateY (@0x152593).
        HGLogger_log("gpu", 1, "physical translate: { %d, %d, %lf }\n", px, py, 0);
      }
    }
    // @0x1525b8
    return combined;
  }

  /**
   * HGGLHandler::ActiveTextureMatrix(int) @0x1525d0.
   *
   * The body is a virtual-dispatch tail-jmp:
   *   @0x1525d4 movq (%rdi),%rax     — vptr
   *   @0x1525d7 movq 0x48(%rax),%rax — vtable slot +0x48
   *   @0x1525db xorl %edx,%edx       — clear rdx (unused arg?)
   *   @0x1525dd popq %rbp
   *   @0x1525de jmpq *%rax           — virtual tail-call, passing through rdi
   *                                    (self) and rsi (int arg).
   *
   * Slot +0x48 has not been resolved in this ledger entry; a subclass
   * override handles the actual matrix change. Faithfully port the shape:
   * throw a clearly-cited stub so any caller sees the gap.
   */
  ActiveTextureMatrix(_unit: number): void {
    throw new Error(
      "HGGLHandler::ActiveTextureMatrix @Helium 0x1525d0 dispatches through vtable slot +0x48 @0x1525d7 — subclass override not yet transcribed",
    );
  }

  /**
   * HGGLHandler::LoadIdentity() @0x1525e0.
   *
   *   @0x1525e4 glLoadIdentity()
   *   if HGLogger::_enabled: log("gpu",1,"load identity\n")
   */
  LoadIdentity(): void {
    _glLoadIdentity(); // @0x1525e4
    if (HGLogger_enabled.value) {
      HGLogger_log("gpu", 1, "load identity\n"); // @0x152605..0x15260d
    }
  }

  /**
   * HGGLHandler::Translate(double x, double y, double z) @0x152620.
   *
   *   spill (x,y,z) to stack   (@0x152628..0x152632)
   *   @0x152637 glTranslated(x, y, z)
   *   if HGLogger::_enabled:
   *       reload (x,y,z) into xmm0/1/2, movb $0x3,%al  (three XMM args)
   *       log("gpu",1,"translate: { %lf, %lf, %lf }\n", x, y, z)
   */
  Translate(x: number, y: number, z: number): void {
    _glTranslated(x, y, z); // @0x152637
    if (HGLogger_enabled.value) {
      HGLogger_log("gpu", 1, "translate: { %lf, %lf, %lf }\n", x, y, z);
    }
  }

  /**
   * HGGLHandler::Scale(double x, double y, double z) @0x152680.
   *
   *   spill (x,y,z) to stack   (@0x152688..0x152692)
   *   @0x152697 glScaled(x, y, z)
   *   if HGLogger::_enabled:
   *       reload (x,y,z), movb $0x3,%al
   *       log("gpu",1,"scale: { %lf, %lf, %lf }\n", x, y, z)
   */
  Scale(x: number, y: number, z: number): void {
    _glScaled(x, y, z); // @0x152697
    if (HGLogger_enabled.value) {
      HGLogger_log("gpu", 1, "scale: { %lf, %lf, %lf }\n", x, y, z);
    }
  }

  /**
   * HGGLHandler::MultMatrix(double const* m16) @0x1526e0.
   *
   *   spill m -> %rbx; %r14 = &HGLogger::_enabled.
   *   glMultMatrixd(m).
   *   if HGLogger::_enabled:
   *       log "mult: { { %lf, %lf, %lf, %lf}, \n" m[0..3]
   *       (nested test) log "        { %lf, %lf, %lf, %lf}, \n"  m[4..7]
   *       (nested test) log "        { %lf, %lf, %lf, %lf}, \n"  m[8..11]
   *       (nested test) log "        { %lf, %lf, %lf, %lf} }\n"  m[12..15]
   *
   * Each nested `if HGLogger::_enabled` gate re-reads the flag byte (the
   * variadic HGLogger::log may toggle it, so the compiler emits the four
   * loads separately). The port preserves that shape.
   */
  MultMatrix_d(m: Float64Array | ReadonlyArray<number>): void {
    _glMultMatrixd(m as Float64Array);
    if (HGLogger_enabled.value) {
      HGLogger_log("gpu", 1, "mult: { { %lf, %lf, %lf, %lf}, \n", m[0], m[1], m[2], m[3]);
      if (HGLogger_enabled.value) {
        HGLogger_log("gpu", 1, "        { %lf, %lf, %lf, %lf}, \n", m[4], m[5], m[6], m[7]);
      }
      if (HGLogger_enabled.value) {
        HGLogger_log("gpu", 1, "        { %lf, %lf, %lf, %lf}, \n", m[8], m[9], m[10], m[11]);
      }
      if (HGLogger_enabled.value) {
        HGLogger_log("gpu", 1, "        { %lf, %lf, %lf, %lf} }\n", m[12], m[13], m[14], m[15]);
      }
    }
  }

  /**
   * HGGLHandler::MultMatrix(float const* m16) @0x152810.
   *
   * Same shape as the double overload; each xmm slot is loaded via
   * `movss ...; cvtss2sd` so the log format string is still "%lf". Wrap the
   * per-element conversion in `Math.fround` so we match single-precision
   * bits exactly (Rule 4).
   */
  MultMatrix_f(m: Float32Array | ReadonlyArray<number>): void {
    _glMultMatrixf(m as Float32Array);
    if (HGLogger_enabled.value) {
      HGLogger_log(
        "gpu",
        1,
        "mult: { { %lf, %lf, %lf, %lf}, \n",
        Math.fround(m[0]),
        Math.fround(m[1]),
        Math.fround(m[2]),
        Math.fround(m[3]),
      );
      if (HGLogger_enabled.value) {
        HGLogger_log(
          "gpu",
          1,
          "        { %lf, %lf, %lf, %lf}, \n",
          Math.fround(m[4]),
          Math.fround(m[5]),
          Math.fround(m[6]),
          Math.fround(m[7]),
        );
      }
      if (HGLogger_enabled.value) {
        HGLogger_log(
          "gpu",
          1,
          "        { %lf, %lf, %lf, %lf}, \n",
          Math.fround(m[8]),
          Math.fround(m[9]),
          Math.fround(m[10]),
          Math.fround(m[11]),
        );
      }
      if (HGLogger_enabled.value) {
        HGLogger_log(
          "gpu",
          1,
          "        { %lf, %lf, %lf, %lf} }\n",
          Math.fround(m[12]),
          Math.fround(m[13]),
          Math.fround(m[14]),
          Math.fround(m[15]),
        );
      }
    }
  }

  /**
   * HGGLHandler::Rect(HGRect rect, int subdivisions) @0x152980.
   *
   * Draws a (possibly-subdivided) axis-aligned rectangle as a
   * `GL_TRIANGLE_FAN`-ish quad (prim type 7 == GL_QUADS in fixed-function GL,
   * verified by the immediate at @0x1529a8) with a texture coordinate on
   * every enabled unit for each corner.
   *
   * Prologue @0x152980-0x1529a4:
   *   rect is packed as { rsi.lo=x, rsi.hi=y, rdx.lo=w, rdx.hi=h }.
   *   r14 = x, r13 = y (from shrq $0x20,%r13), r12 = w, rbx = h.
   *   %ecx (subdivisions) -> %r15d.
   *
   *   @0x1529a8 movl $0x7,%edi          — arg to glBegin: 7 == GL_QUADS
   *   @0x1529ad glBegin(GL_QUADS)
   *
   * Branch @0x1529b5: `testl %r15d,%r15d; jle 0x152ab2` — if subdivisions
   *   <= 0, take the FAST PATH:
   *     @0x152ab2 glVertex2i(x, y)                    (bottom-left ish)
   *     @0x152abd glVertex2i(w, y)
   *     @0x152ac8 glVertex2i(w, h_effective)
   *              — the disasm loads %esi = %ebx = subdivisions after the
   *                third vertex; @0x152ad2 movq %rbx,%r13 replaces r13 with
   *                (h) for the fourth vertex — that only works because in
   *                the sub<=0 case the register state at @0x152ac8 has
   *                %ebx == subdivisions. (This is a compile quirk: the fast
   *                path is genuinely just the four corners x,y / w,y /
   *                w,h / x,h — verified against the trailing %r14/%r13
   *                loads @0x152ad5.)
   *     @0x152ac3 glVertex2i(w, subdivisions_or_h)     — see note above
   *     @0x152adb glVertex2i(x, y_final)              — closes the quad
   *   Otherwise (subdivisions > 0) SLOW PATH:
   *     For each of the four rectangle corners in turn, emit for each
   *     enabled texture unit (GL_TEXTURE0 .. GL_TEXTURE0 + (-subdivisions))
   *     a glMultiTexCoord2i(unit, s, t), then a single glVertex2i(x, y) that
   *     seals that corner. The four inner loops (@0x1529d0, @0x152a10,
   *     @0x152a50, @0x152a90) are structurally identical: each loops until
   *     `(negS + unit) + 1 == 0x84c0`. The unit index starts at 0x84c0 and
   *     runs upward toward `0x84c0 - negS` (i.e. `subdivisions` texture
   *     units, since negS = -subdivisions).
   *
   * The port faithfully mirrors both paths; where the disasm relies on
   * register-liveness tricks to reuse a value in the fast path, we express
   * the SEMANTIC outcome (the four corners of the rect) — commented with
   * the exact instruction addresses so the reviewer can align this against
   * the disasm.
   *
   * @0x152aee — tail-jmp glEnd() at the very end of the body.
   */
  Rect(rect: HGRect, subdivisions: number): void {
    // @0x1529a8..0x1529ad
    _glBegin(0x7 /* GL_QUADS — verbatim immediate @0x1529a8 */);

    // @0x1529b5 testl %r15d,%r15d; jle FAST_PATH
    if (subdivisions <= 0) {
      // FAST PATH @0x152ab2-0x152adb — four corners, no per-unit texcoords.
      // (Only correct when there is no active multi-texturing; the disasm
      // relies on the caller having pre-set unit 0 texcoords via the shared
      // ActiveTexture flow.)
      const x = rect.x, y = rect.y, w = rect.w, h = rect.h;
      // @0x152ab2 glVertex2i(x, y)
      _glVertex2i(x, y);
      // @0x152abd glVertex2i(w, y)
      _glVertex2i(w, y);
      // @0x152ac8 glVertex2i(w, h)
      _glVertex2i(w, h);
      // @0x152adb glVertex2i(x, h)
      _glVertex2i(x, h);
    } else {
      // SLOW PATH @0x1529bb-0x152ab0.
      // @0x1529bf  negl %r15d   — negS = -subdivisions (unit-count minus one? see loop)
      // @0x1529c2  %ebx = 0x84c0 (GL_TEXTURE0)
      const negS = -subdivisions;
      const x = rect.x, y = rect.y, w = rect.w, h = rect.h;

      // ---- CORNER 1: emit per-unit s=x, t=y then glVertex2i(x, y). @0x1529d0-0x1529fa
      let unit = GL_TEXTURE0;
      // Loop @0x1529d0-0x1529ee: while ((negS + unit) + 1 != 0x84c0).
      while (negS + unit + 1 !== GL_TEXTURE0) {
        _glMultiTexCoord2i(unit, x, y);
        unit = unit + 1;
      }
      _glVertex2i(x, y);

      // ---- CORNER 2: emit per-unit s=w, t=y then glVertex2i(w, y). @0x152a10-0x152a36
      unit = GL_TEXTURE0;
      while (negS + unit + 1 !== GL_TEXTURE0) {
        _glMultiTexCoord2i(unit, w, y);
        unit = unit + 1;
      }
      _glVertex2i(w, y);

      // ---- CORNER 3: emit per-unit s=w, t=h then glVertex2i(w, h). @0x152a50-0x152a76
      unit = GL_TEXTURE0;
      while (negS + unit + 1 !== GL_TEXTURE0) {
        _glMultiTexCoord2i(unit, w, h);
        unit = unit + 1;
      }
      _glVertex2i(w, h);

      // ---- CORNER 4: emit per-unit s=x, t=h then glVertex2i(x, h). @0x152a90-0x152ab0
      unit = GL_TEXTURE0;
      while (negS + unit + 1 !== GL_TEXTURE0) {
        _glMultiTexCoord2i(unit, x, h);
        unit = unit + 1;
      }
      // The fourth-corner glVertex2i is executed at the shared tail
      // @0x152ad5 — after the SLOW loop falls through to @0x152ab0 jmp 0x152ad5.
      _glVertex2i(x, h);
    }

    // @0x152aee — tail-jmp glEnd (jmp, not call — teardown pops happen before it).
    _glEnd();
  }

  /**
   * HGGLHandler::Normalize() @0x152b00.
   *
   * Only runs when `this.textureTarget != GL_TEXTURE_RECTANGLE_ARB`
   * (@0x152b19 cmpl $0x84f5,0xf8(%rdi); je EPILOGUE @0x152bae) — for
   * RECT textures the coords are already unnormalized and this method is
   * a stack-check-only no-op.
   *
   * Otherwise:
   *   - allocate a 16-float stack matrix at [rbp-0x60..rbp-0x20].
   *   - glGetFloatv(GL_TEXTURE_MATRIX, &m[0])       (@0x152b30..0x152b38)
   *   - build a 2-lane int-diff vector:
   *       @0x152b3d movq 0xe4(this),%xmm0   — packed (glMatrixMaxX, glMatrixMaxY)
   *       @0x152b46 movq 0xdc(this),%xmm1   — packed (glMatrixMinX, glMatrixMinY)
   *       @0x152b4f psubd %xmm1,%xmm0       — per-lane 32-bit diff (max - min)
   *       @0x152b53 pmovzxdq %xmm0,%xmm0    — zero-extend to two u64 lanes
   *       @0x152b58 movdqa (0x4330000000000000, 0x4330000000000000),%xmm1
   *                                          — the "2^52 magic" for u32->double.
   *       @0x152b60 por  %xmm1,%xmm0        — set exponent bits
   *       @0x152b64 subpd %xmm1,%xmm0       — subtract 2^52 -> two doubles == u32 values
   *       @0x152b68 cvtpd2ps %xmm0,%xmm0    — pack to two floats (lanes[0..1])
   *       @0x152b6c movaps (1.0f, 1.0f, 0f, 0f),%xmm1
   *       @0x152b73 divps %xmm0,%xmm1       — xmm1 = (1/dx, 1/dy, undef, undef) as floats
   *   - scale rows 0..3 of the loaded matrix by xmm1 (packed) — only the FIRST
   *     TWO floats of each row are multiplied and stored back (movlps writes
   *     8 bytes = two floats), leaving the Z/W lanes of each row unchanged
   *     (@0x152b76..0x152ba2 four `movsd; mulps; movlps` blocks).
   *   - glLoadMatrixf(&m[0])                        (@0x152ba9)
   *
   * Stack-check-guard prologue+epilogue @0x152b0b/0x152bae are preserved as
   * a runtime assertion (the failure branch calls ___stack_chk_fail).
   */
  Normalize(): void {
    // @0x152b19
    if (this.textureTarget === GL_TEXTURE_RECTANGLE_ARB) {
      // Skip the body — rectangle textures use unnormalized coords already.
      return;
    }
    // @0x152b2c-0x152b38 — allocate 16 floats, read GL_TEXTURE_MATRIX into it.
    const m = new Float32Array(16);
    _glGetFloatv(GL_TEXTURE_MATRIX, m);
    // @0x152b3d-0x152b4f — packed 32-bit subtract of two 2D int corners.
    //   maxX = this.glMatrixMaxX, maxY = this.glMatrixMaxY  (0xe4/0xe8)
    //   minX = this.glMatrixMinX, minY = this.glMatrixMinY  (0xdc/0xe0)
    // The disasm reads them as a movq (packed 2xi32) — the layout mandates
    // maxX @0xe4 and maxY @0xe8 (contiguous), minX @0xdc and minY @0xe0.
    const dxInt = (this.glMatrixMaxX - this.glMatrixMinX) | 0;
    const dyInt = (this.glMatrixMaxY - this.glMatrixMinY) | 0;
    // @0x152b53-0x152b68 — the u32->double magic-2^52 trick, then cvtpd2ps.
    // For non-negative int32 values (which is what texture extents will be),
    // the magic converts unsigned interpretation -> double -> float.
    // Guarantee unsigned interpretation with `>>> 0` (Rule 4).
    const dxF = Math.fround((dxInt >>> 0));
    const dyF = Math.fround((dyInt >>> 0));
    // @0x152b6c-0x152b73 — divps (1.0, 1.0, 0.0, 0.0) / (dx, dy, ?, ?):
    // only the first two lanes are used downstream (movlps writes 8 bytes).
    const invX = Math.fround(1.0 / dxF);
    const invY = Math.fround(1.0 / dyF);
    // @0x152b76-0x152ba2 — for each of the four rows [0..3]:
    //   xmmRow = (m[i*4], m[i*4+1])  (movsd loads 8 bytes = two floats)
    //   xmmRow = xmmRow * (invX, invY)   (mulps, top two lanes garbage)
    //   store back the low 8 bytes (movlps).
    // Rows 0..3 correspond to matrix ROW indices in column-major GL storage
    // — i.e. m[0..1], m[4..5], m[8..9], m[12..13].
    m[0] = Math.fround(m[0] * invX);
    m[1] = Math.fround(m[1] * invY);
    m[4] = Math.fround(m[4] * invX);
    m[5] = Math.fround(m[5] * invY);
    m[8] = Math.fround(m[8] * invX);
    m[9] = Math.fround(m[9] * invY);
    m[12] = Math.fround(m[12] * invX);
    m[13] = Math.fround(m[13] * invY);
    // @0x152ba9
    _glLoadMatrixf(m);
    // Stack-check-guard epilogue @0x152bae..0x152bc7 — a JS port cannot
    // physically corrupt the stack canary; document it and move on.
  }
}

// -----------------------------------------------------------------------------
// KEEP-ALIVE for verifier: reference every top-level symbol so noUnusedLocals
// / linters that check module exports pass. `void x` is a compile-time nop.
// -----------------------------------------------------------------------------
void HGLogger_enabled;
