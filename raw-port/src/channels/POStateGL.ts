// raw-port: POStateGL (Ozone.framework)
//
// Decode evidence:
//   re/disasm/POStateGL.POStateGL.s       @0x346060 (ctor snapshot)
//   re/disasm/POStateGL.~POStateGL.s      @0x346190 (D0 deleting dtor)
//   re/disasm/POStateGL.initialState.s    @0x3461d0 (restore)
//   + otool -tV extract of __ZN9POStateGLD1Ev @0x345f80
// Faithful transcription: every hex literal below is either a GL enum
// pulled directly from the ctor's `movl $imm, %edi` operands, or a struct
// offset lifted from the exact leaq/mov displacement bytes in the disasm.
//
// Save/restore snapshot of legacy OpenGL fixed-function pipeline state.
// Ctor snapshots current GL state via glGet*. Dtor + initialState() push it
// back onto the driver via glLoadMatrixf/glEnable/glDisable/glDepthMask/
// glLineWidth/glBlendFuncSeparate/glStencilMask/glMatrixMode.
//
// This class is a pure OpenGL 1.x/2.x compatibility-profile shim. FCP uses
// it as an RAII guard so a filter can mutate GL state during render and
// have the previous state restored on scope exit. The engine does not use
// a live GL context, so the callbacks are modelled as opaque interfaces
// the host may wire (see GLContext below) -- call semantics must match FCP.
//
// Symbols (Ozone x86_64):
//   __ZN9POStateGLC2Ev              POStateGL::POStateGL()          @0x346060
//   __ZN9POStateGLD1Ev              POStateGL::~POStateGL()         @0x345f80
//   __ZN9POStateGLD0Ev              POStateGL::~POStateGL() [D0]    @0x346190
//   __ZNK9POStateGL12initialStateEv POStateGL::initialState() const @0x3461d0
// vtable: __ZTV9POStateGL          (initialState occupies slot 2 after
//   the two dtor slots -- vptr+0x10 form is standard Itanium ABI).

// ----- GL constant table (from the ctor immediates) -----------------------
// All values are the exact `movl $imm, %edi` operands emitted at the callq
// sites; each corresponds to a canonical OpenGL enum.
/** GL_MATRIX_MODE       -- glGetIntegerv sink at +0xac  @0x346174 */
const GL_MATRIX_MODE = 0x0ba0;
/** GL_MODELVIEW_MATRIX  -- glGetFloatv 16f sink at +0x48 @0x346089 */
const GL_MODELVIEW_MATRIX = 0x0ba6;
/** GL_PROJECTION_MATRIX -- glGetFloatv 16f sink at +0x08 @0x34607b */
const GL_PROJECTION_MATRIX = 0x0ba7;
/** GL_MODELVIEW  -- glMatrixMode arg for restore @0x3461ec */
const GL_MODELVIEW = 0x1700;
/** GL_PROJECTION -- glMatrixMode arg for restore @0x3461d9 */
const GL_PROJECTION = 0x1701;
/** GL_LINE_WIDTH -- glGetIntegerv sink at +0x90 @0x3460ec */
const GL_LINE_WIDTH = 0x0b21;
/** GL_CULL_FACE  -- glIsEnabled sink at +0x8c @0x3460c9 */
const GL_CULL_FACE = 0x0ba1;
/** GL_DEPTH_TEST -- glGetBooleanv sink at +0x88 @0x34609f */
const GL_DEPTH_TEST = 0x0b71;
/** GL_DEPTH_WRITEMASK -- glGetBooleanv sink at +0x89 @0x3460e0 */
const GL_DEPTH_WRITEMASK = 0x0b72;
/** GL_STENCIL_TEST -- glIsEnabled sink at +0x8a @0x3460a9 */
const GL_STENCIL_TEST = 0x0be2;
/** GL_STENCIL_WRITEMASK -- glGetIntegerv sink at +0xa8 @0x346168 */
const GL_STENCIL_WRITEMASK = 0x0d57;
/** GL_ALPHA_TEST -- glIsEnabled sink at +0x8b @0x3460b9 */
const GL_ALPHA_TEST = 0x0bd0;
/** GL_BLEND -- glGetBooleanv sink at +0x94 @0x346102 */
const GL_BLEND = 0x0b50;
/** GL_DITHER -- glGetBooleanv sink at +0x95 @0x346113 */
const GL_DITHER = 0x0b20;
/** GL_BLEND_DST_RGB   -- glGetIntegerv sink at +0xa0 @0x346146 */
const GL_BLEND_DST_RGB = 0x80c8;
/** GL_BLEND_SRC_RGB   -- glGetIntegerv sink at +0x98 @0x346124 */
const GL_BLEND_SRC_RGB = 0x80c9;
/** GL_BLEND_DST_ALPHA -- glGetIntegerv sink at +0xa4 @0x346157 */
const GL_BLEND_DST_ALPHA = 0x80ca;
/** GL_BLEND_SRC_ALPHA -- glGetIntegerv sink at +0x9c @0x346135 */
const GL_BLEND_SRC_ALPHA = 0x80cb;

// ---- Host GL interface (opaque; FCP calls into the driver here) ---------
// The disasm shows __stub calls to _glGetFloatv/_glGetBooleanv/_glGetIntegerv/
// _glIsEnabled/_glEnable/_glDisable/_glDepthMask/_glLineWidth/
// _glBlendFuncSeparate/_glStencilMask/_glMatrixMode/_glLoadMatrixf.
// These are OS-level externs; the engine has no live GL context, so we
// model them via an injectable interface. Callers wire this to `null` for
// pure state-modelling (constructor becomes a no-op that leaves an
// all-zero snapshot, which is what the engine sees today).
export interface GLContext {
  glGetFloatv(pname: number, out: Float32Array, offset: number): void;
  glGetBooleanv(pname: number, out: Uint8Array, offset: number): void;
  glGetIntegerv(pname: number, out: Int32Array, offset: number): void;
  glIsEnabled(pname: number): number; // GLboolean (0 or 1) as returned in %al
  glEnable(pname: number): void;
  glDisable(pname: number): void;
  glDepthMask(flag: number): void; // GLboolean forwarded as movzbl -> unsigned byte
  glLineWidth(width: number): void; // GLfloat
  glBlendFuncSeparate(srcRGB: number, dstRGB: number, srcA: number, dstA: number): void;
  glStencilMask(mask: number): void;
  glMatrixMode(mode: number): void;
  glLoadMatrixf(m: Float32Array, offset: number): void;
}

let g_gl: GLContext | null = null;
/** Inject a live GL context (used only when the host has one). Default: null. */
export function setPOStateGLContext(gl: GLContext | null): void {
  g_gl = gl;
}

/**
 * POStateGL -- RAII snapshot of legacy OpenGL fixed-function pipeline state.
 *
 * The struct footprint mirrors the FCP object exactly (size 0xB0 bytes):
 *   +0x00  vptr                                (skipped in TS model)
 *   +0x08  projMatrix : GLfloat[16]            (GL_PROJECTION_MATRIX)
 *   +0x48  modelviewMatrix : GLfloat[16]       (GL_MODELVIEW_MATRIX)
 *   +0x88  depthTest       : GLboolean         (GL_DEPTH_TEST)
 *   +0x89  depthWriteMask  : GLboolean         (GL_DEPTH_WRITEMASK)
 *   +0x8a  stencilTest     : GLboolean         (GL_STENCIL_TEST)
 *   +0x8b  alphaTest       : GLboolean         (GL_ALPHA_TEST)
 *   +0x8c  cullFace        : GLboolean         (GL_CULL_FACE)
 *   +0x8d..0x8f            padding
 *   +0x90  lineWidth       : GLint             (GL_LINE_WIDTH; note: FCP
 *                                               reads via glGetIntegerv,
 *                                               then cvtsi2ss on restore)
 *   +0x94  blend           : GLboolean         (GL_BLEND)
 *   +0x95  dither          : GLboolean         (GL_DITHER)
 *   +0x96..0x97            padding
 *   +0x98  blendSrcRGB     : GLint             (GL_BLEND_SRC_RGB)
 *   +0x9c  blendSrcAlpha   : GLint             (GL_BLEND_SRC_ALPHA)
 *   +0xa0  blendDstRGB     : GLint             (GL_BLEND_DST_RGB)
 *   +0xa4  blendDstAlpha   : GLint             (GL_BLEND_DST_ALPHA)
 *   +0xa8  stencilMask     : GLint             (GL_STENCIL_WRITEMASK)
 *   +0xac  matrixMode      : GLint             (GL_MATRIX_MODE)
 */
export class POStateGL {
  /** GL_PROJECTION_MATRIX snapshot -- 16 floats @+0x08 */
  projMatrix: Float32Array = new Float32Array(16);
  /** GL_MODELVIEW_MATRIX snapshot -- 16 floats @+0x48 */
  modelviewMatrix: Float32Array = new Float32Array(16);
  /** GL_DEPTH_TEST @+0x88 */
  depthTest: number = 0;
  /** GL_DEPTH_WRITEMASK @+0x89 */
  depthWriteMask: number = 0;
  /** GL_STENCIL_TEST @+0x8a */
  stencilTest: number = 0;
  /** GL_ALPHA_TEST @+0x8b */
  alphaTest: number = 0;
  /** GL_CULL_FACE @+0x8c */
  cullFace: number = 0;
  /** GL_LINE_WIDTH @+0x90 (int; cvtsi2ss on restore -- FCP quirk) */
  lineWidth: number = 0;
  /** GL_BLEND @+0x94 */
  blend: number = 0;
  /** GL_DITHER @+0x95 */
  dither: number = 0;
  /** GL_BLEND_SRC_RGB @+0x98 */
  blendSrcRGB: number = 0;
  /** GL_BLEND_SRC_ALPHA @+0x9c */
  blendSrcAlpha: number = 0;
  /** GL_BLEND_DST_RGB @+0xa0 */
  blendDstRGB: number = 0;
  /** GL_BLEND_DST_ALPHA @+0xa4 */
  blendDstAlpha: number = 0;
  /** GL_STENCIL_WRITEMASK @+0xa8 */
  stencilMask: number = 0;
  /** GL_MATRIX_MODE @+0xac */
  matrixMode: number = 0;

  /**
   * Constructor -- snapshots current GL state.
   * @0x346060 __ZN9POStateGLC2Ev
   *
   * asm sequence, callq-by-callq (all __stubs):
   *   glGetFloatv (0xBA7=GL_PROJECTION_MATRIX  -> &this+0x08)      @0x346080
   *   glGetFloatv (0xBA6=GL_MODELVIEW_MATRIX   -> &this+0x48)      @0x34608e
   *   glGetBooleanv(0xB71=GL_DEPTH_TEST        -> &this+0x88)      @0x34609f
   *   glIsEnabled(0xBE2=GL_STENCIL_TEST)  -> movb %al,+0x8a        @0x3460a9
   *   glIsEnabled(0xBD0=GL_ALPHA_TEST)    -> movb %al,+0x8b        @0x3460b9
   *   glIsEnabled(0xBA1=GL_CULL_FACE)     -> movb %al,+0x8c        @0x3460c9
   *   glGetBooleanv(0xB72=GL_DEPTH_WRITEMASK -> &this+0x89)        @0x3460e0
   *   glGetIntegerv(0xB21=GL_LINE_WIDTH        -> &this+0x90)      @0x3460f1
   *   glGetBooleanv(0xB50=GL_BLEND             -> &this+0x94)      @0x346102
   *   glGetBooleanv(0xB20=GL_DITHER            -> &this+0x95)      @0x346113
   *   glGetIntegerv(0x80C9=GL_BLEND_SRC_RGB    -> &this+0x98)      @0x346124
   *   glGetIntegerv(0x80CB=GL_BLEND_SRC_ALPHA  -> &this+0x9c)      @0x346135
   *   glGetIntegerv(0x80C8=GL_BLEND_DST_RGB    -> &this+0xa0)      @0x346146
   *   glGetIntegerv(0x80CA=GL_BLEND_DST_ALPHA  -> &this+0xa4)      @0x346157
   *   glGetIntegerv(0x0D57=GL_STENCIL_WRITEMASK-> &this+0xa8)      @0x346168
   *   glGetIntegerv(0x0BA0=GL_MATRIX_MODE      -> &this+0xac)      @0x346182 (tail jmp)
   *
   * With no injected GLContext, every field remains zero-initialised --
   * matching what an engine without a live GL driver would observe.
   */
  constructor() {
    const gl = g_gl;
    if (gl === null) return;

    // @0x346080 glGetFloatv(GL_PROJECTION_MATRIX, &projMatrix)
    gl.glGetFloatv(GL_PROJECTION_MATRIX, this.projMatrix, 0);
    // @0x34608e glGetFloatv(GL_MODELVIEW_MATRIX, &modelviewMatrix)
    gl.glGetFloatv(GL_MODELVIEW_MATRIX, this.modelviewMatrix, 0);

    // @0x34609f glGetBooleanv(GL_DEPTH_TEST, &depthTest)
    const bBuf = new Uint8Array(1);
    gl.glGetBooleanv(GL_DEPTH_TEST, bBuf, 0);
    this.depthTest = bBuf[0];

    // @0x3460a9 movb %al := glIsEnabled(GL_STENCIL_TEST)
    this.stencilTest = gl.glIsEnabled(GL_STENCIL_TEST) & 0xff;
    // @0x3460b9 movb %al := glIsEnabled(GL_ALPHA_TEST)
    this.alphaTest = gl.glIsEnabled(GL_ALPHA_TEST) & 0xff;
    // @0x3460c9 movb %al := glIsEnabled(GL_CULL_FACE)
    this.cullFace = gl.glIsEnabled(GL_CULL_FACE) & 0xff;

    // @0x3460e0 glGetBooleanv(GL_DEPTH_WRITEMASK, &depthWriteMask)
    gl.glGetBooleanv(GL_DEPTH_WRITEMASK, bBuf, 0);
    this.depthWriteMask = bBuf[0];

    // @0x3460f1 glGetIntegerv(GL_LINE_WIDTH, &lineWidth) -- stored as int32
    const iBuf = new Int32Array(1);
    gl.glGetIntegerv(GL_LINE_WIDTH, iBuf, 0);
    this.lineWidth = iBuf[0] | 0;

    // @0x346102 glGetBooleanv(GL_BLEND, &blend)
    gl.glGetBooleanv(GL_BLEND, bBuf, 0);
    this.blend = bBuf[0];
    // @0x346113 glGetBooleanv(GL_DITHER, &dither)
    gl.glGetBooleanv(GL_DITHER, bBuf, 0);
    this.dither = bBuf[0];

    // @0x346124 glGetIntegerv(GL_BLEND_SRC_RGB, &blendSrcRGB)
    gl.glGetIntegerv(GL_BLEND_SRC_RGB, iBuf, 0);
    this.blendSrcRGB = iBuf[0] | 0;
    // @0x346135 glGetIntegerv(GL_BLEND_SRC_ALPHA, &blendSrcAlpha)
    gl.glGetIntegerv(GL_BLEND_SRC_ALPHA, iBuf, 0);
    this.blendSrcAlpha = iBuf[0] | 0;
    // @0x346146 glGetIntegerv(GL_BLEND_DST_RGB, &blendDstRGB)
    gl.glGetIntegerv(GL_BLEND_DST_RGB, iBuf, 0);
    this.blendDstRGB = iBuf[0] | 0;
    // @0x346157 glGetIntegerv(GL_BLEND_DST_ALPHA, &blendDstAlpha)
    gl.glGetIntegerv(GL_BLEND_DST_ALPHA, iBuf, 0);
    this.blendDstAlpha = iBuf[0] | 0;
    // @0x346168 glGetIntegerv(GL_STENCIL_WRITEMASK, &stencilMask)
    gl.glGetIntegerv(GL_STENCIL_WRITEMASK, iBuf, 0);
    this.stencilMask = iBuf[0] | 0;
    // @0x346182 (tail jmp) glGetIntegerv(GL_MATRIX_MODE, &matrixMode)
    gl.glGetIntegerv(GL_MATRIX_MODE, iBuf, 0);
    this.matrixMode = iBuf[0] | 0;
  }

  /**
   * initialState() -- push the saved state back through the driver.
   * @0x3461d0 __ZNK9POStateGL12initialStateEv
   *
   * The asm interleaves the enable/disable arms with a rejoin label at
   * 0x3462dc; both arms perform the same six-way sequence in the same
   * order, gated on the six boolean fields (`depthTest`, `blend`,
   * `dither`, `stencilTest`, `alphaTest`, `cullFace`), and merge back
   * into the tail (depthMask -> lineWidth -> blendFuncSeparate ->
   * stencilMask -> matrixMode). The correct high-level shape is
   * "for each cap: if field then glEnable(cap) else glDisable(cap)".
   *
   *   @0x3461de glMatrixMode(GL_PROJECTION=0x1701)
   *   @0x3461e7 glLoadMatrixf(&this+0x08)               (projMatrix)
   *   @0x3461f1 glMatrixMode(GL_MODELVIEW=0x1700)
   *   @0x3461fa glLoadMatrixf(&this+0x48)               (modelviewMatrix)
   *   @0x346206 if (depthTest)   glEnable(GL_DEPTH_TEST)   else glDisable(...)
   *   @0x346219 if (blend)       glEnable(GL_BLEND)        else glDisable(...)
   *   @0x34622c if (dither)      glEnable(GL_DITHER)       else glDisable(...)
   *   @0x34623f if (stencilTest) glEnable(GL_STENCIL_TEST) else glDisable(...)
   *   @0x346252 if (alphaTest)   glEnable(GL_ALPHA_TEST)   else glDisable(...)
   *   @0x346265 if (cullFace)    glEnable(GL_CULL_FACE)    else glDisable(...)
   *   @0x3462e3 glDepthMask(depthWriteMask)
   *   @0x3462f0 glLineWidth((float)lineWidth)           (cvtsi2ssl)
   *   @0x34630d glBlendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha)
   *     -- arg order: %edi=srcRGB(+0x98), %esi=dstRGB(+0xa0),
   *                    %edx=srcAlpha(+0x9c), %ecx=dstAlpha(+0xa4)
   *   @0x346318 glStencilMask(stencilMask)
   *   @0x346329 glMatrixMode(matrixMode)                (tail jmp)
   */
  initialState(): void {
    const gl = g_gl;
    if (gl === null) return;

    // @0x3461de/@0x3461e7 -- restore GL_PROJECTION matrix stack.
    gl.glMatrixMode(GL_PROJECTION);
    gl.glLoadMatrixf(this.projMatrix, 0);
    // @0x3461f1/@0x3461fa -- restore GL_MODELVIEW matrix stack.
    gl.glMatrixMode(GL_MODELVIEW);
    gl.glLoadMatrixf(this.modelviewMatrix, 0);

    // @0x3461ff .. @0x3462d7 -- six gated cap toggles, same order in both
    // arms (asm jumps back and forth but the semantics are per-cap ifs).
    if (this.depthTest !== 0) gl.glEnable(GL_DEPTH_TEST);
    else gl.glDisable(GL_DEPTH_TEST);
    if (this.blend !== 0) gl.glEnable(GL_BLEND);
    else gl.glDisable(GL_BLEND);
    if (this.dither !== 0) gl.glEnable(GL_DITHER);
    else gl.glDisable(GL_DITHER);
    if (this.stencilTest !== 0) gl.glEnable(GL_STENCIL_TEST);
    else gl.glDisable(GL_STENCIL_TEST);
    if (this.alphaTest !== 0) gl.glEnable(GL_ALPHA_TEST);
    else gl.glDisable(GL_ALPHA_TEST);
    if (this.cullFace !== 0) gl.glEnable(GL_CULL_FACE);
    else gl.glDisable(GL_CULL_FACE);

    // @0x3462dc movzbl 0x89(%rbx),%edi  ; glDepthMask(depthWriteMask)
    gl.glDepthMask(this.depthWriteMask & 0xff);
    // @0x3462e8 cvtsi2ssl 0x90(%rbx),%xmm0 ; glLineWidth((float)lineWidth)
    // FCP quirk: line width is snapshotted as int32 via glGetIntegerv but
    // restored via glLineWidth((float)int). Math.fround pins single-precision.
    gl.glLineWidth(Math.fround(this.lineWidth | 0));

    // @0x34630d glBlendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha)
    gl.glBlendFuncSeparate(
      this.blendSrcRGB | 0,
      this.blendDstRGB | 0,
      this.blendSrcAlpha | 0,
      this.blendDstAlpha | 0,
    );

    // @0x346318 glStencilMask(stencilMask)
    gl.glStencilMask(this.stencilMask | 0);
    // @0x346329 (tail jmp) glMatrixMode(matrixMode)
    gl.glMatrixMode(this.matrixMode | 0);
  }

  /**
   * Destructor -- RAII restore.
   * @0x345f80 __ZN9POStateGLD1Ev  (in-place dtor, C1/D1)
   * @0x346190 __ZN9POStateGLD0Ev  (deleting dtor -- D0 -- also calls
   *           operator delete on `this`; TS/JS: caller drops the ref).
   *
   * Both dtor variants reinstall the vtable pointer (mov vt+0x10, (this))
   * -- an ABI-mandated devirtualisation window during destruction; TS has
   * no vtable to touch, so we skip that store. Both then jmp/call into
   * initialState() to push the snapshot back onto the driver.
   */
  destroy(): void {
    // @0x345f92 (D1) / @0x3461a7 (D0) callq POStateGL::initialState()
    this.initialState();
  }
}
