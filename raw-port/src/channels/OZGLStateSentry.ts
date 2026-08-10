// raw-port: OZGLStateSentry (Ozone.framework) — the base-object constructor.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro), x86_64 slice.
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED (this commit)
// -----------------------------------------------------------------------------
//   * OZGLStateSentry::OZGLStateSentry()  [C2, base-object ctor]  @Ozone 0x5cd890
//     __ZN15OZGLStateSentryC2Ev
//     re/disasm: raw-port/re/disasm/__ZN15OZGLStateSentryC2Ev.s  (64 lines)
//
//   * OZGLStateSentry::restoreInitialState() const              @Ozone 0x5cda00
//     __ZNK15OZGLStateSentry19restoreInitialStateEv
//     re/disasm: raw-port/re/disasm/__ZNK15OZGLStateSentry19restoreInitialStateEv.s
//     (83 lines) — ADDED in a later commit on this branch; the ctor above is
//     untouched by it (one method, one exported function, ADD-only).
//
// Sibling symbols of the same class (`nm -arch x86_64 -n Ozone`) are SEPARATE
// ledger units and are deliberately NOT written here:
//   0x5cd9d0 C1                      0x5cd9e0 D2       0x5cdb70 D1   0x5cdb90 D0
//   0x5cdbc0 restoreInitialViewport() const
//   0x5cdbe0 restoreInitialTransformation() const
//
// OZGLStateSentry is the Ozone RAII guard that snapshots legacy OpenGL
// fixed-function pipeline state on construction so a later restore can push it
// back. It is the close cousin of the already-landed `POStateGL`
// (raw-port/src/channels/POStateGL.ts, ctor @Ozone 0x346060) — same idiom, same
// glGet* vocabulary — but a DIFFERENT class with a different field set, a
// different layout, and a viewport member POStateGL does not have. Nothing is
// shared or imported between the two: POStateGL's `GLContext` describes the
// restore-side entry points that class calls, which this ctor does not.
//
// -----------------------------------------------------------------------------
// FULL DISASM — C2 (64 lines, @0x5cd890..@0x5cd9c1)
// -----------------------------------------------------------------------------
//   __ZN15OZGLStateSentryC2Ev:
//     0x5cd890  pushq %rbp
//     0x5cd891  movq  %rsp, %rbp
//     0x5cd894  pushq %rbx
//     0x5cd895  pushq %rax
//     0x5cd896  movq  %rdi, %rbx                ; rbx = this
//     0x5cd899  leaq  0x2b4a08(%rip), %rax      ; = 0x5cd8a0 + 0x2b4a08 = 0x8822a8
//     0x5cd8a0  movq  %rax, (%rdi)              ; this->vptr = 0x8822a8
//     0x5cd8a3  leaq  0x8(%rdi), %rsi
//     0x5cd8a7  movl  $0xba2, %edi              ; GL_VIEWPORT
//     0x5cd8ac  callq 0x6dfefa                  ; stub _glGetIntegerv   -> this+0x08
//     0x5cd8b1  leaq  0x18(%rbx), %rsi
//     0x5cd8b5  movl  $0xba7, %edi              ; GL_PROJECTION_MATRIX
//     0x5cd8ba  callq 0x6dfef4                  ; stub _glGetFloatv     -> this+0x18
//     0x5cd8bf  leaq  0x58(%rbx), %rsi
//     0x5cd8c3  movl  $0xba6, %edi              ; GL_MODELVIEW_MATRIX
//     0x5cd8c8  callq 0x6dfef4                  ; stub _glGetFloatv     -> this+0x58
//     0x5cd8cd  leaq  0x98(%rbx), %rsi
//     0x5cd8d4  movl  $0xb71, %edi              ; GL_DEPTH_TEST
//     0x5cd8d9  callq 0x6dfee8                  ; stub _glGetBooleanv   -> this+0x98
//     0x5cd8de  movl  $0xbe2, %edi              ; GL_BLEND
//     0x5cd8e3  callq 0x6dff00                  ; stub _glIsEnabled
//     0x5cd8e8  movb  %al, 0x9a(%rbx)           ; this+0x9a = al
//     0x5cd8ee  movl  $0xbd0, %edi              ; GL_DITHER
//     0x5cd8f3  callq 0x6dff00                  ; stub _glIsEnabled
//     0x5cd8f8  movb  %al, 0x9b(%rbx)           ; this+0x9b = al
//     0x5cd8fe  movl  $0xba1, %edi              ; GL_NORMALIZE
//     0x5cd903  callq 0x6dff00                  ; stub _glIsEnabled
//     0x5cd908  movb  %al, 0x9c(%rbx)           ; this+0x9c = al
//     0x5cd90e  leaq  0x99(%rbx), %rsi
//     0x5cd915  movl  $0xb72, %edi              ; GL_DEPTH_WRITEMASK
//     0x5cd91a  callq 0x6dfee8                  ; stub _glGetBooleanv   -> this+0x99
//     0x5cd91f  leaq  0xa0(%rbx), %rsi
//     0x5cd926  movl  $0xb21, %edi              ; GL_LINE_WIDTH
//     0x5cd92b  callq 0x6dfefa                  ; stub _glGetIntegerv   -> this+0xa0
//     0x5cd930  leaq  0xa4(%rbx), %rsi
//     0x5cd937  movl  $0xb50, %edi              ; GL_LIGHTING
//     0x5cd93c  callq 0x6dfee8                  ; stub _glGetBooleanv   -> this+0xa4
//     0x5cd941  leaq  0xa5(%rbx), %rsi
//     0x5cd948  movl  $0xb20, %edi              ; GL_LINE_SMOOTH
//     0x5cd94d  callq 0x6dfee8                  ; stub _glGetBooleanv   -> this+0xa5
//     0x5cd952  leaq  0xa8(%rbx), %rsi
//     0x5cd959  movl  $0x80c9, %edi             ; GL_BLEND_SRC_RGB
//     0x5cd95e  callq 0x6dfefa                  ; stub _glGetIntegerv   -> this+0xa8
//     0x5cd963  leaq  0xac(%rbx), %rsi
//     0x5cd96a  movl  $0x80cb, %edi             ; GL_BLEND_SRC_ALPHA
//     0x5cd96f  callq 0x6dfefa                  ; stub _glGetIntegerv   -> this+0xac
//     0x5cd974  leaq  0xb0(%rbx), %rsi
//     0x5cd97b  movl  $0x80c8, %edi             ; GL_BLEND_DST_RGB
//     0x5cd980  callq 0x6dfefa                  ; stub _glGetIntegerv   -> this+0xb0
//     0x5cd985  leaq  0xb4(%rbx), %rsi
//     0x5cd98c  movl  $0x80ca, %edi             ; GL_BLEND_DST_ALPHA
//     0x5cd991  callq 0x6dfefa                  ; stub _glGetIntegerv   -> this+0xb4
//     0x5cd996  leaq  0xb8(%rbx), %rsi
//     0x5cd99d  movl  $0xd57, %edi              ; GL_STENCIL_BITS
//     0x5cd9a2  callq 0x6dfefa                  ; stub _glGetIntegerv   -> this+0xb8
//     0x5cd9a7  addq  $0xbc, %rbx               ; rbx = this+0xbc
//     0x5cd9ae  movl  $0xba0, %edi              ; GL_MATRIX_MODE
//     0x5cd9b3  movq  %rbx, %rsi
//     0x5cd9b6  addq  $0x8, %rsp
//     0x5cd9ba  popq  %rbx
//     0x5cd9bb  popq  %rbp
//     0x5cd9bc  jmp   0x6dfefa                  ; TAIL _glGetIntegerv    -> this+0xbc
//     0x5cd9c1  nopw  %cs:(%rax,%rax)           ; alignment padding
//
// There is NO unwind/landing-pad block after the body: every callee is a
// nothrow C driver entry point, so the ctor has a single linear path.
//
// -----------------------------------------------------------------------------
// VPTR — 0x8822a8 = __ZTV15OZGLStateSentry + 0x10
// -----------------------------------------------------------------------------
// `nm -arch x86_64 -n Ozone` gives 0x882298 S __ZTV15OZGLStateSentry and
// 0x8822b8 S __ZTI15OZGLStateSentry. The ctor stores 0x882298 + 0x10 — the
// standard Itanium ABI vptr, which points PAST the vtable's 8-byte
// offset-to-top and 8-byte typeinfo slots to the first virtual-function slot.
// The class does have virtuals (D1/D0 at 0x5cdb70/0x5cdb90 are the two dtor
// slots). This ctor only STORES the pointer; it never dispatches through it, so
// there is no indirect/virtual call in this unit.
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT — every offset is a literal displacement byte from the disasm
// -----------------------------------------------------------------------------
//   +0x00        vptr                                      (0x8822a8) @0x5cd8a0
//   +0x08..0x17  GLint     viewport[4]        GL_VIEWPORT            @0x5cd8ac
//   +0x18..0x57  GLfloat   projMatrix[16]     GL_PROJECTION_MATRIX   @0x5cd8ba
//   +0x58..0x97  GLfloat   modelviewMatrix[16] GL_MODELVIEW_MATRIX   @0x5cd8c8
//   +0x98        GLboolean depthTest          GL_DEPTH_TEST          @0x5cd8d9
//   +0x99        GLboolean depthWriteMask     GL_DEPTH_WRITEMASK     @0x5cd91a
//   +0x9a        GLboolean blendEnabled       glIsEnabled(GL_BLEND)  @0x5cd8e8
//   +0x9b        GLboolean ditherEnabled      glIsEnabled(GL_DITHER) @0x5cd8f8
//   +0x9c        GLboolean normalizeEnabled   glIsEnabled(GL_NORMALIZE) @0x5cd908
//   +0x9d..0x9f  padding (never written)
//   +0xa0        GLint     lineWidth          GL_LINE_WIDTH          @0x5cd92b
//   +0xa4        GLboolean lighting           GL_LIGHTING            @0x5cd93c
//   +0xa5        GLboolean lineSmooth         GL_LINE_SMOOTH         @0x5cd94d
//   +0xa6..0xa7  padding (never written)
//   +0xa8        GLint     blendSrcRGB        GL_BLEND_SRC_RGB       @0x5cd95e
//   +0xac        GLint     blendSrcAlpha      GL_BLEND_SRC_ALPHA     @0x5cd96f
//   +0xb0        GLint     blendDstRGB        GL_BLEND_DST_RGB       @0x5cd980
//   +0xb4        GLint     blendDstAlpha      GL_BLEND_DST_ALPHA     @0x5cd991
//   +0xb8        GLint     stencilBits        GL_STENCIL_BITS        @0x5cd9a2
//   +0xbc        GLint     matrixMode         GL_MATRIX_MODE         @0x5cd9bc (tail)
//
// The three ARRAY extents are pinned by the offsets themselves, not assumed:
// the viewport sink at +0x08 is followed by the next sink at +0x18, i.e. 16
// bytes = 4 GLint — exactly what GL_VIEWPORT writes; the projection sink at
// +0x18 is followed by +0x58, i.e. 64 bytes = 16 GLfloat — exactly a 4x4
// matrix; likewise +0x58 -> +0x98 for the modelview matrix. Total object size
// is at least 0xc0 (the +0xbc GLint closes at 0xc0); the ctor writes no byte
// beyond that.
//
// -----------------------------------------------------------------------------
// GL ENUM NAMES — resolved from the installed SDK header, not from memory
// -----------------------------------------------------------------------------
// Every constant below is the exact `movl $imm, %edi` operand at the cited call
// site. The NAMES were looked up in
//   .../MacOSX.sdk/System/Library/Frameworks/OpenGL.framework/Headers/gl.h
// NOTE for reviewers: the landed sibling raw-port/src/channels/POStateGL.ts
// labels several of these same values differently (it calls 0x0be2
// GL_STENCIL_TEST, 0x0bd0 GL_ALPHA_TEST, 0x0ba1 GL_CULL_FACE, 0x0b50 GL_BLEND,
// 0x0b20 GL_DITHER, 0x0d57 GL_STENCIL_WRITEMASK). The SDK header disagrees with
// those labels; this file uses the header's names. Only the NUMERIC values are
// load-bearing for faithfulness, and those are transcribed from the immediates,
// so the disagreement is a documentation matter in that other file — it is
// NOT touched here (one symbol, one file).

/** GL_VIEWPORT — `movl $0xba2, %edi` @0x5cd8a7 (glGetIntegerv -> +0x08). */
const GL_VIEWPORT = 0x0ba2;
/** GL_PROJECTION_MATRIX — `movl $0xba7, %edi` @0x5cd8b5 (glGetFloatv -> +0x18). */
const GL_PROJECTION_MATRIX = 0x0ba7;
/** GL_MODELVIEW_MATRIX — `movl $0xba6, %edi` @0x5cd8c3 (glGetFloatv -> +0x58). */
const GL_MODELVIEW_MATRIX = 0x0ba6;
/** GL_DEPTH_TEST — `movl $0xb71, %edi` @0x5cd8d4 (glGetBooleanv -> +0x98). */
const GL_DEPTH_TEST = 0x0b71;
/** GL_BLEND — `movl $0xbe2, %edi` @0x5cd8de (glIsEnabled -> movb %al, +0x9a). */
const GL_BLEND = 0x0be2;
/** GL_DITHER — `movl $0xbd0, %edi` @0x5cd8ee (glIsEnabled -> movb %al, +0x9b). */
const GL_DITHER = 0x0bd0;
/** GL_NORMALIZE — `movl $0xba1, %edi` @0x5cd8fe (glIsEnabled -> movb %al, +0x9c). */
const GL_NORMALIZE = 0x0ba1;
/** GL_DEPTH_WRITEMASK — `movl $0xb72, %edi` @0x5cd915 (glGetBooleanv -> +0x99). */
const GL_DEPTH_WRITEMASK = 0x0b72;
/** GL_LINE_WIDTH — `movl $0xb21, %edi` @0x5cd926 (glGetIntegerv -> +0xa0). */
const GL_LINE_WIDTH = 0x0b21;
/** GL_LIGHTING — `movl $0xb50, %edi` @0x5cd937 (glGetBooleanv -> +0xa4). */
const GL_LIGHTING = 0x0b50;
/** GL_LINE_SMOOTH — `movl $0xb20, %edi` @0x5cd948 (glGetBooleanv -> +0xa5). */
const GL_LINE_SMOOTH = 0x0b20;
/** GL_BLEND_SRC_RGB — `movl $0x80c9, %edi` @0x5cd959 (glGetIntegerv -> +0xa8). */
const GL_BLEND_SRC_RGB = 0x80c9;
/** GL_BLEND_SRC_ALPHA — `movl $0x80cb, %edi` @0x5cd96a (glGetIntegerv -> +0xac). */
const GL_BLEND_SRC_ALPHA = 0x80cb;
/** GL_BLEND_DST_RGB — `movl $0x80c8, %edi` @0x5cd97b (glGetIntegerv -> +0xb0). */
const GL_BLEND_DST_RGB = 0x80c8;
/** GL_BLEND_DST_ALPHA — `movl $0x80ca, %edi` @0x5cd98c (glGetIntegerv -> +0xb4). */
const GL_BLEND_DST_ALPHA = 0x80ca;
/** GL_STENCIL_BITS — `movl $0xd57, %edi` @0x5cd99d (glGetIntegerv -> +0xb8). */
const GL_STENCIL_BITS = 0x0d57;
/** GL_MATRIX_MODE — `movl $0xba0, %edi` @0x5cd9ae (tail glGetIntegerv -> +0xbc). */
const GL_MATRIX_MODE = 0x0ba0;

// ---- added for restoreInitialState() @0x5cda00 -----------------------------
// The restore path selects a matrix stack before each glLoadMatrixf. These two
// immediates appear only in that method; the six cap enums it toggles
// (GL_DEPTH_TEST / GL_LIGHTING / GL_LINE_SMOOTH / GL_BLEND / GL_DITHER /
// GL_NORMALIZE) are already declared above from the ctor's own immediates and
// carry the identical values there — 0xb71/0xb50/0xb20/0xbe2/0xbd0/0xba1 — so
// they are REUSED rather than redeclared.
/** GL_PROJECTION — `movl $0x1701, %edi` @0x5cda1a (glMatrixMode arg). */
const GL_PROJECTION = 0x1701;
/** GL_MODELVIEW — `movl $0x1700, %edi` @0x5cda2d (glMatrixMode arg). */
const GL_MODELVIEW = 0x1700;

/**
 * The vptr this ctor installs: `leaq 0x2b4a08(%rip), %rax` @0x5cd899 with
 * RIP-after = 0x5cd8a0, so 0x5cd8a0 + 0x2b4a08 = 0x8822a8. That is
 * `__ZTV15OZGLStateSentry` (0x882298 per `nm -n`) + 0x10 — the Itanium ABI vptr
 * past the offset-to-top and typeinfo slots.
 *
 * @0xADDR Ozone 0x8822a8
 */
export const OZGLStateSentry_VPTR = 0x8822a8 as const;

/**
 * Host OpenGL entry points this constructor reaches, all through __TEXT symbol
 * stubs. They are TRUE OUT-OF-SCOPE externs (`U` undefined symbols in Ozone's
 * symbol table, resolved to OpenGL.framework — not Helium/ProCore/ProChannel/
 * Ozone/Flexo code), so they are modelled as an injectable interface rather
 * than transcribed. This mirrors the landed `GLContext` shape in
 * raw-port/src/channels/POStateGL.ts, but is declared locally: that interface
 * also carries the restore-side entry points (glEnable/glLoadMatrixf/...) which
 * this ctor does not call, and src/channels has no cross-class reach-in.
 *
 * The `out`/`offset` pair models the `%rsi` sink pointer the disasm forms with
 * `leaq <disp>(%rbx), %rsi`: the driver writes through it in place.
 */
export interface OZGLStateSentryGL {
  /** `_glGetIntegerv` @stub Ozone 0x6dfefa. */
  glGetIntegerv(pname: number, out: Int32Array, offset: number): void;
  /** `_glGetFloatv` @stub Ozone 0x6dfef4. */
  glGetFloatv(pname: number, out: Float32Array, offset: number): void;
  /** `_glGetBooleanv` @stub Ozone 0x6dfee8. */
  glGetBooleanv(pname: number, out: Uint8Array, offset: number): void;
  /** `_glIsEnabled` @stub Ozone 0x6dff00 — GLboolean returned in %al. */
  glIsEnabled(pname: number): number;

  // ---- restore-side entry points, reached only by restoreInitialState()
  // @0x5cda00. Nine more TRUE out-of-scope OpenGL.framework stubs; depgraph.py
  // reports `n_extern_oos: 9` for that node (and `deps: []`, `indirect: 0`).
  /** `_glViewport(GLint x, GLint y, GLsizei w, GLsizei h)` @stub Ozone 0x6dff5a. */
  glViewport(x: number, y: number, width: number, height: number): void;
  /** `_glMatrixMode(GLenum mode)` @stub Ozone 0x6dff18. */
  glMatrixMode(mode: number): void;
  /** `_glLoadMatrixf(const GLfloat* m)` @stub Ozone 0x6dff12. The disasm passes
   *  an INTERIOR pointer into the object (`leaq 0x18(%rbx)` / `leaq 0x58(%rbx)`),
   *  so the offset is part of the call, not of the array. */
  glLoadMatrixf(m: Float32Array, offset: number): void;
  /** `_glEnable(GLenum cap)` @stub Ozone 0x6dfec4. */
  glEnable(cap: number): void;
  /** `_glDisable(GLenum cap)` @stub Ozone 0x6dfebe. */
  glDisable(cap: number): void;
  /** `_glDepthMask(GLboolean flag)` @stub Ozone 0x6dfeb8 — fed through a
   *  `movzbl`, so the argument is an unsigned byte. */
  glDepthMask(flag: number): void;
  /** `_glLineWidth(GLfloat width)` @stub Ozone 0x6dff06. */
  glLineWidth(width: number): void;
  /** `_glBlendFuncSeparate(GLenum srcRGB, GLenum dstRGB, GLenum srcAlpha,
   *  GLenum dstAlpha)` @stub Ozone 0x6dfe9a. */
  glBlendFuncSeparate(srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void;
  /** `_glStencilMask(GLuint mask)` @stub Ozone 0x6dff42. */
  glStencilMask(mask: number): void;
}

let g_gl: OZGLStateSentryGL | null = null;

/**
 * Inject the live GL context used by `OZGLStateSentry_C2`. Default `null`,
 * which is what the headless engine has: with no driver attached the glGet*
 * calls write nothing, so the snapshot keeps the zero-initialised values the
 * allocation started with. That is the faithful modelling of "the driver did
 * not touch the sink", not a fabricated fallback.
 *
 * @0xADDR Ozone 0x5cd890  (the ctor these callbacks serve)
 */
export function setOZGLStateSentryGLContext(gl: OZGLStateSentryGL | null): void {
  g_gl = gl;
}

/**
 * `OZGLStateSentry` — the snapshot object this ctor fills in.
 *
 * Field names come from the GL enum each sink is fed (see the OBJECT LAYOUT
 * block in the file header); every offset is a literal displacement byte from
 * the disassembly. Byte-width per field is likewise read off the sink spacing
 * and the glGet* variant used, never assumed.
 *
 * @0xADDR Ozone 0x5cd890
 */
export interface OZGLStateSentryState {
  /** +0x00 — vptr, stored @0x5cd8a0. Always `OZGLStateSentry_VPTR`. */
  vptr: number;
  /** +0x08..+0x17 — `GLint viewport[4]` (GL_VIEWPORT) @0x5cd8ac. */
  viewport: Int32Array;
  /** +0x18..+0x57 — `GLfloat projMatrix[16]` (GL_PROJECTION_MATRIX) @0x5cd8ba. */
  projMatrix: Float32Array;
  /** +0x58..+0x97 — `GLfloat modelviewMatrix[16]` (GL_MODELVIEW_MATRIX) @0x5cd8c8. */
  modelviewMatrix: Float32Array;
  /** +0x98 — `GLboolean` (GL_DEPTH_TEST) @0x5cd8d9. */
  depthTest: number;
  /** +0x99 — `GLboolean` (GL_DEPTH_WRITEMASK) @0x5cd91a. */
  depthWriteMask: number;
  /** +0x9a — `%al` of `glIsEnabled(GL_BLEND)` @0x5cd8e8. */
  blendEnabled: number;
  /** +0x9b — `%al` of `glIsEnabled(GL_DITHER)` @0x5cd8f8. */
  ditherEnabled: number;
  /** +0x9c — `%al` of `glIsEnabled(GL_NORMALIZE)` @0x5cd908. */
  normalizeEnabled: number;
  /** +0xa0 — `GLint` (GL_LINE_WIDTH, read as an integer) @0x5cd92b. */
  lineWidth: number;
  /** +0xa4 — `GLboolean` (GL_LIGHTING) @0x5cd93c. */
  lighting: number;
  /** +0xa5 — `GLboolean` (GL_LINE_SMOOTH) @0x5cd94d. */
  lineSmooth: number;
  /** +0xa8 — `GLint` (GL_BLEND_SRC_RGB) @0x5cd95e. */
  blendSrcRGB: number;
  /** +0xac — `GLint` (GL_BLEND_SRC_ALPHA) @0x5cd96f. */
  blendSrcAlpha: number;
  /** +0xb0 — `GLint` (GL_BLEND_DST_RGB) @0x5cd980. */
  blendDstRGB: number;
  /** +0xb4 — `GLint` (GL_BLEND_DST_ALPHA) @0x5cd991. */
  blendDstAlpha: number;
  /** +0xb8 — `GLint` (GL_STENCIL_BITS) @0x5cd9a2. */
  stencilBits: number;
  /** +0xbc — `GLint` (GL_MATRIX_MODE), the tail call's sink @0x5cd9bc. */
  matrixMode: number;
}

/**
 * Allocate the raw object the ctor is handed in `%rdi`: `operator new` /
 * automatic storage before any field is written. Every scalar starts at 0 and
 * the arrays at their zero fill, which is what the ctor's sinks overwrite.
 *
 * This is NOT part of the transcribed body — it is the caller-side storage the
 * ABI requires `%rdi` to point at, factored out so `OZGLStateSentry_C2` can
 * write into it exactly as the disassembly does.
 *
 * @0xADDR Ozone 0x5cd890
 */
export function OZGLStateSentry_alloc(): OZGLStateSentryState {
  return {
    vptr: 0,
    viewport: new Int32Array(4),
    projMatrix: new Float32Array(16),
    modelviewMatrix: new Float32Array(16),
    depthTest: 0,
    depthWriteMask: 0,
    blendEnabled: 0,
    ditherEnabled: 0,
    normalizeEnabled: 0,
    lineWidth: 0,
    lighting: 0,
    lineSmooth: 0,
    blendSrcRGB: 0,
    blendSrcAlpha: 0,
    blendDstRGB: 0,
    blendDstAlpha: 0,
    stencilBits: 0,
    matrixMode: 0,
  };
}

/**
 * `OZGLStateSentry::OZGLStateSentry()` [C2, base-object ctor] — @Ozone 0x5cd890
 * (`__ZN15OZGLStateSentryC2Ev`).
 *
 * Faithful line-for-line transcription of the 64-line body quoted in the file
 * header: install the vptr, then snapshot eighteen pieces of legacy GL
 * fixed-function state into the object, IN THE ORDER THE BINARY ISSUES THEM.
 * That order is not sorted by offset — the three `glIsEnabled` probes into
 * +0x9a/+0x9b/+0x9c run BEFORE the `glGetBooleanv(GL_DEPTH_WRITEMASK)` into
 * +0x99 — and it is preserved here because the calls hit a stateful driver.
 *
 * The final `glGetIntegerv(GL_MATRIX_MODE, this+0xbc)` is a TAIL jump
 * (@0x5cd9bc), so its result is the ctor's `%eax`; a ctor's return value is
 * unused by the ABI, so nothing is returned here beyond the constructed object.
 *
 * Four frontier callees, all TRUE out-of-scope OpenGL externs reached through
 * __TEXT stubs: `_glGetIntegerv` @0x6dfefa, `_glGetFloatv` @0x6dfef4,
 * `_glGetBooleanv` @0x6dfee8, `_glIsEnabled` @0x6dff00. No in-scope callee. No
 * indirect/virtual call — the vptr @0x5cd8a0 is stored, never dispatched
 * through.
 *
 * @param self  `%rdi` — the storage to construct into (see `OZGLStateSentry_alloc`).
 * @returns     `self`, constructed.
 *
 * @0xADDR Ozone 0x5cd890
 */
export function OZGLStateSentry_C2(
  self: OZGLStateSentryState,
): OZGLStateSentryState {
  // @0x5cd896  movq %rdi, %rbx                   ; rbx = this
  // @0x5cd899  leaq 0x2b4a08(%rip), %rax         ; rax = 0x8822a8
  // @0x5cd8a0  movq %rax, (%rdi)                 ; this->vptr = 0x8822a8
  self.vptr = OZGLStateSentry_VPTR;

  const gl = g_gl;
  if (gl === null) {
    // No driver attached: the glGet* sinks are never written, so the object
    // keeps the zero state it was allocated with. Faithful to "the callee did
    // not run" — the ctor itself has no branch here.
    return self;
  }

  // @0x5cd8a3/0x5cd8a7/0x5cd8ac
  //   leaq 0x8(%rdi), %rsi ; movl $0xba2, %edi ; callq _glGetIntegerv
  gl.glGetIntegerv(GL_VIEWPORT, self.viewport, 0);

  // @0x5cd8b1/0x5cd8b5/0x5cd8ba
  //   leaq 0x18(%rbx), %rsi ; movl $0xba7, %edi ; callq _glGetFloatv
  gl.glGetFloatv(GL_PROJECTION_MATRIX, self.projMatrix, 0);

  // @0x5cd8bf/0x5cd8c3/0x5cd8c8
  //   leaq 0x58(%rbx), %rsi ; movl $0xba6, %edi ; callq _glGetFloatv
  gl.glGetFloatv(GL_MODELVIEW_MATRIX, self.modelviewMatrix, 0);

  // A one-byte staging buffer for the `glGetBooleanv` sinks: the disasm hands
  // the driver a `GLboolean*` into the object, so each call writes exactly one
  // byte at the cited offset.
  const bBuf = new Uint8Array(1);
  // A one-int staging buffer for the `glGetIntegerv` scalar sinks (`GLint*`).
  const iBuf = new Int32Array(1);

  // @0x5cd8cd/0x5cd8d4/0x5cd8d9
  //   leaq 0x98(%rbx), %rsi ; movl $0xb71, %edi ; callq _glGetBooleanv
  bBuf[0] = 0;
  gl.glGetBooleanv(GL_DEPTH_TEST, bBuf, 0);
  self.depthTest = bBuf[0];

  // @0x5cd8de/0x5cd8e3  movl $0xbe2, %edi ; callq _glIsEnabled
  // @0x5cd8e8           movb %al, 0x9a(%rbx)      ; low byte of the return
  self.blendEnabled = gl.glIsEnabled(GL_BLEND) & 0xff;

  // @0x5cd8ee/0x5cd8f3  movl $0xbd0, %edi ; callq _glIsEnabled
  // @0x5cd8f8           movb %al, 0x9b(%rbx)
  self.ditherEnabled = gl.glIsEnabled(GL_DITHER) & 0xff;

  // @0x5cd8fe/0x5cd903  movl $0xba1, %edi ; callq _glIsEnabled
  // @0x5cd908           movb %al, 0x9c(%rbx)
  self.normalizeEnabled = gl.glIsEnabled(GL_NORMALIZE) & 0xff;

  // @0x5cd90e/0x5cd915/0x5cd91a
  //   leaq 0x99(%rbx), %rsi ; movl $0xb72, %edi ; callq _glGetBooleanv
  bBuf[0] = 0;
  gl.glGetBooleanv(GL_DEPTH_WRITEMASK, bBuf, 0);
  self.depthWriteMask = bBuf[0];

  // @0x5cd91f/0x5cd926/0x5cd92b
  //   leaq 0xa0(%rbx), %rsi ; movl $0xb21, %edi ; callq _glGetIntegerv
  iBuf[0] = 0;
  gl.glGetIntegerv(GL_LINE_WIDTH, iBuf, 0);
  self.lineWidth = iBuf[0];

  // @0x5cd930/0x5cd937/0x5cd93c
  //   leaq 0xa4(%rbx), %rsi ; movl $0xb50, %edi ; callq _glGetBooleanv
  bBuf[0] = 0;
  gl.glGetBooleanv(GL_LIGHTING, bBuf, 0);
  self.lighting = bBuf[0];

  // @0x5cd941/0x5cd948/0x5cd94d
  //   leaq 0xa5(%rbx), %rsi ; movl $0xb20, %edi ; callq _glGetBooleanv
  bBuf[0] = 0;
  gl.glGetBooleanv(GL_LINE_SMOOTH, bBuf, 0);
  self.lineSmooth = bBuf[0];

  // @0x5cd952/0x5cd959/0x5cd95e
  //   leaq 0xa8(%rbx), %rsi ; movl $0x80c9, %edi ; callq _glGetIntegerv
  iBuf[0] = 0;
  gl.glGetIntegerv(GL_BLEND_SRC_RGB, iBuf, 0);
  self.blendSrcRGB = iBuf[0];

  // @0x5cd963/0x5cd96a/0x5cd96f
  //   leaq 0xac(%rbx), %rsi ; movl $0x80cb, %edi ; callq _glGetIntegerv
  iBuf[0] = 0;
  gl.glGetIntegerv(GL_BLEND_SRC_ALPHA, iBuf, 0);
  self.blendSrcAlpha = iBuf[0];

  // @0x5cd974/0x5cd97b/0x5cd980
  //   leaq 0xb0(%rbx), %rsi ; movl $0x80c8, %edi ; callq _glGetIntegerv
  iBuf[0] = 0;
  gl.glGetIntegerv(GL_BLEND_DST_RGB, iBuf, 0);
  self.blendDstRGB = iBuf[0];

  // @0x5cd985/0x5cd98c/0x5cd991
  //   leaq 0xb4(%rbx), %rsi ; movl $0x80ca, %edi ; callq _glGetIntegerv
  iBuf[0] = 0;
  gl.glGetIntegerv(GL_BLEND_DST_ALPHA, iBuf, 0);
  self.blendDstAlpha = iBuf[0];

  // @0x5cd996/0x5cd99d/0x5cd9a2
  //   leaq 0xb8(%rbx), %rsi ; movl $0xd57, %edi ; callq _glGetIntegerv
  iBuf[0] = 0;
  gl.glGetIntegerv(GL_STENCIL_BITS, iBuf, 0);
  self.stencilBits = iBuf[0];

  // @0x5cd9a7  addq $0xbc, %rbx      ; rbx = this+0xbc
  // @0x5cd9ae  movl $0xba0, %edi     ; GL_MATRIX_MODE
  // @0x5cd9b3  movq %rbx, %rsi
  // @0x5cd9bc  jmp  _glGetIntegerv   ; TAIL call — its %eax becomes the ctor's
  iBuf[0] = 0;
  gl.glGetIntegerv(GL_MATRIX_MODE, iBuf, 0);
  self.matrixMode = iBuf[0];

  return self;
}

/**
 * `OZGLStateSentry::restoreInitialState() const` — @Ozone 0x5cda00
 * (`__ZNK15OZGLStateSentry19restoreInitialStateEv`).
 *
 * The mirror image of the C2 ctor above: it pushes the eighteen-field snapshot
 * back through the driver. Faithful line-for-line transcription of the 83-line
 * body (raw-port/re/disasm/__ZNK15OZGLStateSentry19restoreInitialStateEv.s),
 * which issues its driver calls in this exact order:
 *
 *   @0x5cda09..0x5cda15  glViewport(+0x08, +0x0c, +0x10, +0x14)
 *   @0x5cda1a  glMatrixMode(GL_PROJECTION = 0x1701)
 *   @0x5cda28  glLoadMatrixf(this + 0x18)          (projMatrix)
 *   @0x5cda2d  glMatrixMode(GL_MODELVIEW = 0x1700)
 *   @0x5cda3b  glLoadMatrixf(this + 0x58)          (modelviewMatrix)
 *   @0x5cda40  if (+0x98) glEnable(GL_DEPTH_TEST)  else glDisable(...)
 *   @0x5cda53  if (+0xa4) glEnable(GL_LIGHTING)    else glDisable(...)
 *   @0x5cda66  if (+0xa5) glEnable(GL_LINE_SMOOTH) else glDisable(...)
 *   @0x5cda79  if (+0x9a) glEnable(GL_BLEND)       else glDisable(...)
 *   @0x5cda8c  if (+0x9b) glEnable(GL_DITHER)      else glDisable(...)
 *   @0x5cda9f  if (+0x9c) glEnable(GL_NORMALIZE)   else glDisable(...)
 *   @0x5cdb1d  glDepthMask(movzbl +0x99)
 *   @0x5cdb29  glLineWidth((float)(int)+0xa0)      (cvtsi2ssl)
 *   @0x5cdb4e  glBlendFuncSeparate(+0xa8, +0xb0, +0xac, +0xb4)
 *   @0x5cdb59  glStencilMask(+0xb8)
 *   @0x5cdb6a  glMatrixMode(+0xbc)                 (TAIL jmp)
 *
 * Every offset it touches is one the ctor above already wrote, and the OBJECT
 * LAYOUT block in the file header covers all of them — this method reveals no
 * new field. (It does put the +0xb8 slot the ctor filled from GL_STENCIL_BITS
 * into `glStencilMask`, and the +0xa0 slot the ctor filled from GL_LINE_WIDTH
 * into `glLineWidth`; the field names stay as the ctor named them.)
 *
 * CONTROL FLOW of the six cap toggles — clang tail-duplicated the chain into a
 * contiguous "all enabled" run (@0x5cda49..0x5cdab2) and a contiguous "all
 * disabled" run (@0x5cdab4..0x5cdb13) which jump into each other after every
 * test, so at run time the two runs interleave. Reading every cross edge:
 *
 *   @0x5cda47  je  0x5cdab4  ; depthTest  == 0 -> disable arm
 *   @0x5cdac5  jne 0x5cda5c  ; lighting   != 0 -> back to the enable arm
 *   @0x5cda5a  je  0x5cdac7  ; lighting   == 0 -> disable arm
 *   @0x5cdad8  jne 0x5cda6f  ; lineSmooth != 0 -> back to the enable arm
 *   @0x5cda6d  je  0x5cdada  ; lineSmooth == 0 -> disable arm
 *   @0x5cdaeb  jne 0x5cda82  ; blend      != 0 -> back to the enable arm
 *   @0x5cda80  je  0x5cdaed  ; blend      == 0 -> disable arm
 *   @0x5cdafe  jne 0x5cda95  ; dither     != 0 -> back to the enable arm
 *   @0x5cda93  je  0x5cdb00  ; dither     == 0 -> disable arm
 *   @0x5cdb11  jne 0x5cdaa8  ; normalize  != 0 -> back to the enable arm
 *   @0x5cdaa6  je  0x5cdb13  ; normalize  == 0 -> disable arm
 *   @0x5cdab2  jmp 0x5cdb1d  ; the enable arm rejoins the tail
 *   @0x5cdb13..0x5cdb18 glDisable(GL_NORMALIZE), then FALLS THROUGH to 0x5cdb1d
 *
 * Every cross edge lands on the test for the NEXT cap in the same order and
 * both arms rejoin at 0x5cdb1d, so the six toggles are independent: for each
 * cap, `flag != 0 ? glEnable(cap) : glDisable(cap)`. Each test is a
 * `cmpb $0x0` + `je` pair — a "not equal to zero" test, not the strict
 * `cmpb $0x1` byte compare used elsewhere in the port — so it is transcribed
 * as `!== 0`.
 *
 * NINE frontier callees, all TRUE out-of-scope OpenGL externs reached through
 * __TEXT stubs (listed on `OZGLStateSentryGL` above). No in-scope callee, no
 * indirect/virtual call: `depgraph.py` reports `deps: []`, `n_extern_oos: 9`,
 * `indirect: 0`. Note this method never dispatches through the vptr the ctor
 * installed, even though it is itself reachable from the class's virtual dtors.
 *
 * The `const` qualifier in the C++ signature matches the `__ZNK...` mangling —
 * every field access below is a read and the body writes nothing.
 *
 * @param self  `%rdi` — the snapshot to push back (see `OZGLStateSentry_C2`).
 *
 * @0xADDR Ozone 0x5cda00
 */
export function OZGLStateSentry_restoreInitialState(
  self: OZGLStateSentryState,
): void {
  const gl = g_gl;
  if (gl === null) {
    // No driver attached: the calls below reach nothing, exactly as in the
    // ctor's own no-driver path. The method itself has no branch here.
    return;
  }

  // @0x5cda09  movl 0x8(%rdi), %edi    ; x        = viewport[0]
  // @0x5cda0c  movl 0xc(%rbx), %esi    ; y        = viewport[1]
  // @0x5cda0f  movl 0x10(%rbx), %edx   ; width    = viewport[2]
  // @0x5cda12  movl 0x14(%rbx), %ecx   ; height   = viewport[3]
  // @0x5cda15  callq _glViewport
  //   The four GLints are the +0x08..+0x17 block the ctor filled with one
  //   glGetIntegerv(GL_VIEWPORT) @0x5cd8ac, read back element by element.
  gl.glViewport(
    self.viewport[0] | 0,
    self.viewport[1] | 0,
    self.viewport[2] | 0,
    self.viewport[3] | 0,
  );

  // @0x5cda1a  movl $0x1701, %edi  /  @0x5cda1f  callq _glMatrixMode
  gl.glMatrixMode(GL_PROJECTION);
  // @0x5cda24  leaq 0x18(%rbx), %rdi  /  @0x5cda28  callq _glLoadMatrixf
  gl.glLoadMatrixf(self.projMatrix, 0);
  // @0x5cda2d  movl $0x1700, %edi  /  @0x5cda32  callq _glMatrixMode
  gl.glMatrixMode(GL_MODELVIEW);
  // @0x5cda37  leaq 0x58(%rbx), %rdi  /  @0x5cda3b  callq _glLoadMatrixf
  gl.glLoadMatrixf(self.modelviewMatrix, 0);

  // @0x5cda40  cmpb $0x0, 0x98(%rbx)  /  @0x5cda47  je 0x5cdab4
  if (self.depthTest !== 0) gl.glEnable(GL_DEPTH_TEST); // @0x5cda49
  else gl.glDisable(GL_DEPTH_TEST); // @0x5cdab4
  // @0x5cda53  cmpb $0x0, 0xa4(%rbx)  /  @0x5cda5a  je 0x5cdac7
  if (self.lighting !== 0) gl.glEnable(GL_LIGHTING); // @0x5cda5c
  else gl.glDisable(GL_LIGHTING); // @0x5cdac7
  // @0x5cda66  cmpb $0x0, 0xa5(%rbx)  /  @0x5cda6d  je 0x5cdada
  if (self.lineSmooth !== 0) gl.glEnable(GL_LINE_SMOOTH); // @0x5cda6f
  else gl.glDisable(GL_LINE_SMOOTH); // @0x5cdada
  // @0x5cda79  cmpb $0x0, 0x9a(%rbx)  /  @0x5cda80  je 0x5cdaed
  if (self.blendEnabled !== 0) gl.glEnable(GL_BLEND); // @0x5cda82
  else gl.glDisable(GL_BLEND); // @0x5cdaed
  // @0x5cda8c  cmpb $0x0, 0x9b(%rbx)  /  @0x5cda93  je 0x5cdb00
  if (self.ditherEnabled !== 0) gl.glEnable(GL_DITHER); // @0x5cda95
  else gl.glDisable(GL_DITHER); // @0x5cdb00
  // @0x5cda9f  cmpb $0x0, 0x9c(%rbx)  /  @0x5cdaa6  je 0x5cdb13
  if (self.normalizeEnabled !== 0) gl.glEnable(GL_NORMALIZE); // @0x5cdaa8
  else gl.glDisable(GL_NORMALIZE); // @0x5cdb13
  // @0x5cdab2  jmp 0x5cdb1d (enable arm) / fall-through from 0x5cdb18 (disable arm)

  // @0x5cdb1d  movzbl 0x99(%rbx), %edi  /  @0x5cdb24  callq _glDepthMask
  //   `movzbl` zero-extends, so the driver sees the raw unsigned byte.
  gl.glDepthMask(self.depthWriteMask & 0xff);
  // @0x5cdb29  cvtsi2ssl 0xa0(%rbx), %xmm0  /  @0x5cdb31  callq _glLineWidth
  //   Signed int32 -> float32 conversion; Math.fround pins the single
  //   precision the `ss` form produces. (The ctor snapshotted this slot with
  //   glGetIntegerv @0x5cd92b, so the round trip really is int -> float.)
  gl.glLineWidth(Math.fround(self.lineWidth | 0));

  // @0x5cdb36  movl 0xb0(%rbx), %esi   ; dstRGB   loaded FIRST
  // @0x5cdb3c  movl 0xa8(%rbx), %edi   ; srcRGB
  // @0x5cdb42  movl 0xac(%rbx), %edx   ; srcAlpha
  // @0x5cdb48  movl 0xb4(%rbx), %ecx   ; dstAlpha
  // @0x5cdb4e  callq _glBlendFuncSeparate
  //   The factors sit in memory as (srcRGB, srcAlpha, dstRGB, dstAlpha) — the
  //   order the ctor's four glGetIntegerv calls wrote them in — but
  //   glBlendFuncSeparate takes (srcRGB, dstRGB, srcAlpha, dstAlpha), which is
  //   why the disasm loads +0xb0 into %esi before +0xac into %edx.
  gl.glBlendFuncSeparate(
    self.blendSrcRGB | 0,
    self.blendDstRGB | 0,
    self.blendSrcAlpha | 0,
    self.blendDstAlpha | 0,
  );

  // @0x5cdb53  movl 0xb8(%rbx), %edi  /  @0x5cdb59  callq _glStencilMask
  gl.glStencilMask(self.stencilBits | 0);
  // @0x5cdb5e  movl 0xbc(%rbx), %edi
  // @0x5cdb64..0x5cdb69  epilogue (addq $0x8,%rsp; popq %rbx; popq %rbp)
  // @0x5cdb6a  jmp _glMatrixMode      ; TAIL CALL — the last driver call
  gl.glMatrixMode(self.matrixMode | 0);
}
