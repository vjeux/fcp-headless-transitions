// HGRasterizer.ts — Helium's software rasterizer/GL-state object. This file
// currently holds ONE transcribed method: `rotatef(float, float, float, float)`,
// the OpenGL-style glRotatef() dispatched through the rasterizer's current
// matrix stack. Other members will be added by later ports.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// SOURCE DISASSEMBLY:
//   raw-port/re/disasm/Helium.HGRasterizer.rotatef.s   @0x1975c0
//
// STRUCT LAYOUT (partial — recovered strictly from the byte offsets touched by
// rotatef @0x1975c0 and the sibling scalef @0x197500, which has the identical
// dispatch prologue; only fields ACTUALLY LOADED are named here — the rest of
// the class remains unmapped and will be filled in by later methods):
//
//   struct HGRasterizer {
//     // +0x000..+0x1af  unmapped so far.
//     // +0x1b0          array of controller-slot pointers indexed by the
//     //                 GL_PROJECTION top-of-stack byte at +0x440. Each slot
//     //                 is 8 bytes (movq 0x1b0(%rdi,%rax,8)); the slot value
//     //                 is a pointer-to-pointer: the outer load fetches a
//     //                 "holder", then `movq (%rax), %rdi` fetches the actual
//     //                 controller. When that controller pointer is NULL the
//     //                 method silently returns (the `testq %rdi,%rdi; je`
//     //                 at 0x1975f3).
//     //                 Only slots 0..(+0x440-value) are ever indexed; a full
//     //                 count is not observable from rotatef alone.
//     projStackSlots: unknown[];  // +0x1b0  (holder pointers; 8B each)
//     // +0x1b8..+0x2ff  unmapped so far.
//     // +0x300          the GL_MODELVIEW transform controller EMBEDDED in the
//     //                 HGRasterizer (not a pointer — the code does
//     //                 `addq $0x300, %rdi; jmp <vtable-dispatch>` at
//     //                 0x1975d8/0x1975df, then treats `%rdi` as an object
//     //                 with a vtable at (%rdi)). So the MODELVIEW controller
//     //                 lives in-place at rasterizer+0x300.
//     modelViewController: unknown;  // +0x300  (embedded controller object)
//     // +0x308..+0x43f  unmapped so far.
//     // +0x440          byte  GL_PROJECTION top-of-stack index (movzbl at
//     //                 0x1975e1 uses a 1-byte load). Used to index into
//     //                 the +0x1b0 slot array.
//     projStackTop: number;            // +0x440  u8
//     // +0x441..+0x44f  unmapped so far.
//     // +0x450          u32  current OpenGL matrix mode enum:
//     //                   0x1700 GL_MODELVIEW  (from GL/gl.h)
//     //                   0x1702 GL_PROJECTION (from GL/gl.h)
//     //                 See raw-port/src/infra/LiMatrixStack.ts for the same
//     //                 enum reference (LiMatrixStack also compares against
//     //                 0x1702). Any other value falls through to the plain
//     //                 return at 0x197615.
//     matrixMode: number;              // +0x450  u32
//   }
//

/** GL_MODELVIEW = 0x1700 — read as u32 from HGRasterizer+0x450 at
 *  disasm 0x1975d1 (`cmpl $0x1700, %eax`). Source: OpenGL gl.h enum. */
const GL_MODELVIEW = 0x1700;

/** GL_PROJECTION = 0x1702 — read as u32 from HGRasterizer+0x450 at
 *  disasm 0x1975ca (`cmpl $0x1702, %eax`). Source: OpenGL gl.h enum.
 *  Same constant appears in LiMatrixStack.ts (see comment there). */
const GL_PROJECTION = 0x1702;

/** Byte offset of the u32 matrix-mode field on HGRasterizer, read at
 *  disasm 0x1975c4 (`movl 0x450(%rdi), %eax`). */
const OFF_MATRIX_MODE = 0x450;
/** Byte offset of the u8 GL_PROJECTION top-of-stack index, read at
 *  disasm 0x1975e1 (`movzbl 0x440(%rdi), %eax`). */
const OFF_PROJ_STACK_TOP = 0x440;
/** Byte offset of the GL_PROJECTION controller-slot array (8-byte holder
 *  pointers), addressed at disasm 0x1975e8
 *  (`movq 0x1b0(%rdi,%rax,8), %rax`). */
const OFF_PROJ_STACK_SLOTS = 0x1b0;
/** Byte offset of the embedded GL_MODELVIEW controller — reached at disasm
 *  0x1975d8 by `addq $0x300, %rdi` and treated as an object with a vtable
 *  at (%rdi). */
const OFF_MODELVIEW_CONTROLLER = 0x300;

/** Byte offset of the CURRENT color (packed 4-float [r,g,b,a] SSE lane),
 *  written by color4f at disasm 0x1978e6 (`movaps %xmm0, 0x260(%rdi)`). */
const OFF_CURRENT_COLOR = 0x260;

/** Byte offset of the CURRENT line width (a single f32), written by
 *  setLineWidth at disasm 0x1978c4 (`movss %xmm0, 0x258(%rdi)`). It sits
 *  immediately below OFF_CURRENT_COLOR (0x258 + 4 = 0x25c, then the 16-byte
 *  color lane starts at the next 16-byte boundary, 0x260). */
const OFF_LINE_WIDTH = 0x258;

/** Modeled HGRasterizer shape used by rotatef. Only the fields the disasm
 *  touches are named; the rest of the class is unmapped and marked so. */
export interface HGRasterizer {
  /** +0x1b0  — see OFF_PROJ_STACK_SLOTS above. */
  projStackSlots: readonly (TransformControllerHolder | null)[];
  /** +0x300  — embedded GL_MODELVIEW controller, addressed BY OFFSET
   *  (not by pointer). See OFF_MODELVIEW_CONTROLLER above. */
  modelViewController: TransformController;
  /** +0x440  — u8 top-of-stack index into projStackSlots. */
  projStackTop: number;
  /** +0x450  — u32 current GL matrix mode (GL_MODELVIEW / GL_PROJECTION /
   *  other). See OFF_MATRIX_MODE above. */
  matrixMode: number;
  /** +0x454  — u32 flags word. Bit 0 (0x1) is the "clear to black" request
   *  flag, OR'd into the low byte by clearToBlack() @0x1981f4
   *  (`orb $0x1, 0x454(%rdi)`).
   *
   *  WIDTH EVIDENCE (from the enableBlending unit, @0x198230):
   *  `HGRasterizer::GetRasterizerFlags()` @0x1a0300 returns the whole word via
   *  `movl 0x454(%rdi), %eax`. enableBlending @0x198237/@0x198240 likewise
   *  performs a 32-bit `orl 0x454(%rdi), %edx` / `movl %edx, 0x454(%rdi)`
   *  read-modify-write, and HGGLNode's skipDODCalculations_DEPRECATED
   *  @0xdb48b..@0xdb4cb ORs 0x100/0x200/0x400 into the same offset.
   *  Byte operations such as clearToBlack's `orb` update only the low byte and
   *  therefore preserve bits 8..31 of this word.
   *
   *  BIT MAP, each bit grounded in the sibling that sets it (all Helium):
   *    0x01  clearToBlack()               @0x1981f4  orb  $0x1
   *          ...and enableBlending() @0x19823d, unconditionally, via `orl $0x5`
   *    0x02  enableDepthTest()            @0x197d64  orb  $0x2
   *    0x04  enableBlending()             @0x19823d  orl  $0x5   (bit 2 = blending on)
   *          cleared by disableBlending() @0x198254  andb $-0x5  (AND ~0x4)
   *    0x08  enableDepthGeneration()      @0x197d74  orb  $0x8
   *    0x10  forceNoClearToBlack()        @0x198204  orb  $0x10
   *    0x20  enableBlending()'s `bool` argument, shifted into place @0x198234
   *    0x40  enableInplaceBlending()      @0x197654  orb  $0x40
   *          read back by BindTexture()   @0x19ad9e  testb $0x40
   *    0x80  enableXFormConcatenation()   @0x195a60  orb  $-0x80
   *  Bits 8+ are set on this offset by HGGLNode (above); whether that is this
   *  same class is not established here, so they are left unmapped. */
  flags0x454: number;
  /** +0x424  — u32 `HGLBlendMode`, the blend mode enum. Written whole by
   *  enableBlending() @0x198246 (`movl %esi, 0x424(%rdi)`) and read as a u32
   *  elsewhere in Helium — `HGColorGamma::GetOutput` compares it against 1, 2
   *  and 3 (@0xf6211, @0xf629a, @0xf64b5), and the accessor next door to
   *  GetRasterizerFlags reads it at @0x1a0314. The enum's names are not
   *  recoverable from these instructions, so the value is kept as the raw
   *  32-bit integer the machine stores. */
  blendMode0x424: number;
  /** +0x260  — the rasterizer's CURRENT color as a packed 4-float vector
   *  [r, g, b, a] (a 16-byte SSE lane). Written by color4f @0x1978d0 via a
   *  single `movaps %xmm0, 0x260(%rdi)`. See OFF_CURRENT_COLOR below. */
  currentColor: [number, number, number, number];
  /** +0x258 — the rasterizer's CURRENT line width, ONE f32 (glLineWidth-style).
   *  Written by setLineWidth @0x1978c0 via a single `movss %xmm0, 0x258(%rdi)`;
   *  the `ss` (scalar single) form is what pins the width at 4 bytes, as
   *  against the 16-byte `movaps` its +0x260 neighbour uses. See
   *  OFF_LINE_WIDTH above. Its reader is FRONTIER — not decoded here. */
  lineWidth: number;
}

/** A GL_PROJECTION stack slot at rasterizer+0x1b0+8*i is a pointer-to-
 *  pointer: the outer holder is dereferenced ONCE (`movq (%rax), %rdi`
 *  at 0x1975f0) to reach the actual controller. Modeled as a { ctrl }
 *  cell so the two dereferences remain visible. */
export interface TransformControllerHolder {
  ctrl: TransformController | null;
}

/** The controller object whose vtable dispatches the OpenGL matrix-op
 *  calls. Only the two slots touched by rotatef (0x80) and scalef (0x90)
 *  are named here; both take double-precision arguments after the
 *  cvtss2sd widenings the caller performs. */
export interface TransformController {
  /** vtable slot +0x80, as loaded at disasm 0x197608
   *  (`movq (%rdi), %rax; movq 0x80(%rax), %rax; jmpq *%rax`).
   *  Signature after cvtss2sd of xmm0..xmm3 is (double, double, double, double).
   *  This is the virtual "rotate" entry — extern boundary @0x1975c0, not yet
   *  transcribed. */
  rotate(angleDeg: number, x: number, y: number, z: number): void;
}

/**
 * HGRasterizer::rotatef(float, float, float, float) — glRotatef-style entry
 * that dispatches the rotation onto the CURRENT matrix stack's top-of-stack
 * transform controller.
 *
 * @0x1975c0  __ZN12HGRasterizer7rotatefEffff
 *
 * Disasm control flow (raw-port/re/disasm/Helium.HGRasterizer.rotatef.s):
 *
 *   0x1975c4  movl   0x450(%rdi), %eax          ; eax = this.matrixMode (u32)
 *   0x1975ca  cmpl   $0x1702, %eax              ; compare vs GL_PROJECTION
 *   0x1975cf  je     0x1975e1                   ; if PROJECTION -> stack path
 *   0x1975d1  cmpl   $0x1700, %eax              ; compare vs GL_MODELVIEW
 *   0x1975d6  jne    0x197615                   ; unknown mode -> plain return
 *   0x1975d8  addq   $0x300, %rdi               ; rdi = &this.modelViewController
 *   0x1975df  jmp    0x1975f8                   ; -> vtable dispatch (skip NULL guard)
 *   0x1975e1  movzbl 0x440(%rdi), %eax          ; eax = this.projStackTop (u8)
 *   0x1975e8  movq   0x1b0(%rdi,%rax,8), %rax   ; rax = this.projStackSlots[top]
 *   0x1975f0  movq   (%rax), %rdi               ; rdi = *rax  (holder->ctrl)
 *   0x1975f3  testq  %rdi, %rdi                 ; NULL check on the controller
 *   0x1975f6  je     0x197615                   ; NULL -> plain return
 *   0x1975f8  cvtss2sd %xmm0..%xmm3             ; widen the four f32 args to f64
 *   0x197608  movq   (%rdi), %rax               ; rax = vptr
 *   0x19760b  movq   0x80(%rax), %rax           ; rax = vptr[+0x80]  (rotate slot)
 *   0x197613  jmpq   *%rax                      ; tail-call the virtual
 *   0x197615  <no controller / unknown mode>    ; popq %rbp; retq   -- silent no-op
 *
 * Numerics: the four f32 args are widened to f64 via cvtss2sd BEFORE the
 * virtual call, so the port passes them through Math.fround (their exact
 * f32 identity) — the widening to double is implicit in JS number.
 * The MODELVIEW branch DELIBERATELY SKIPS the NULL check (`jmp 0x1975f8`
 * lands PAST the `testq/je`), because `this + 0x300` is an EMBEDDED
 * subobject and can never be null. The PROJECTION branch DOES NULL-check
 * (a projection slot may hold a null controller pointer) and returns
 * silently if so — this is the observed behavior, not a defensive add-on.
 */
export function HGRasterizer_rotatef(
  self: HGRasterizer,
  angle: number,
  x: number,
  y: number,
  z: number,
): void {
  // 0x1975c4-0x1975cf — dispatch on the current OpenGL matrix mode.
  const mode = self.matrixMode; // u32 @+0x450

  let ctrl: TransformController;

  if (mode === GL_PROJECTION) {
    // 0x1975e1 — u8 top-of-stack index into the +0x1b0 slot array.
    const top = self.projStackTop & 0xff;
    // 0x1975e8 — indexed load of the holder pointer (8 bytes per slot).
    const holder = self.projStackSlots[top];
    if (holder === null || holder === undefined) {
      // The disasm does NOT explicitly guard against an out-of-range /
      // absent holder before the `movq (%rax), %rdi` — it would just
      // dereference garbage. Modeling this in TS as a NULL controller
      // is the closest faithful surface; both branches end at 0x197615
      // (the "silent return") when the controller is null.
      return; // matches 0x197615 (popq/retq) path
    }
    // 0x1975f0 — second deref: holder->ctrl (the ACTUAL controller pointer).
    const c = holder.ctrl;
    // 0x1975f3-0x1975f6 — testq/je on the controller pointer.
    if (c === null) {
      return; // 0x197615 (silent no-op — matches "je 0x197615")
    }
    ctrl = c;
  } else if (mode === GL_MODELVIEW) {
    // 0x1975d8 — `addq $0x300, %rdi`. The MODELVIEW controller is an
    // EMBEDDED subobject at rasterizer+0x300; the jump at 0x1975df lands
    // PAST the null check, so we do not null-check here either.
    ctrl = self.modelViewController;
  } else {
    // 0x1975d6 (jne 0x197615) — any mode other than the two enum values
    // above returns immediately with no side-effect.
    return;
  }

  // 0x1975f8-0x197604 — cvtss2sd on all four f32 args (widen f32 -> f64
  // before the virtual call). The Math.fround wrapping preserves the
  // f32 identity of the value BEFORE widening (which is what the compiler
  // saw at the call site). @0x1975f8 @0x1975fc @0x197600 @0x197604
  const angleD = Math.fround(angle);
  const xD = Math.fround(x);
  const yD = Math.fround(y);
  const zD = Math.fround(z);

  // 0x197608-0x197613 — virtual dispatch through vptr[+0x80] (the "rotate"
  // slot on TransformController). This is the tail call `jmpq *%rax` and
  // is an extern boundary @0x1975c0: the concrete virtual target is not
  // yet transcribed.
  ctrl.rotate(angleD, xD, yD, zD);
}

/**
 * HGRasterizer::clearToBlack() @Helium 0x1981f0  (__ZN12HGRasterizer12clearToBlackEv)
 *
 * Requests that the rasterizer clear its framebuffer to black by setting bit 0
 * of the u32 flags word at +0x454. A deferred flag: the actual clear happens
 * later when the flag is consumed; this entry point just records the request.
 *
 * DECODE (raw-port/re/disasm/Helium.__ZN12HGRasterizer12clearToBlackEv.s):
 *   0x1981f0  pushq %rbp ; movq %rsp,%rbp        ; frame
 *   0x1981f4  orb   $0x1, 0x454(%rdi)            ; *(u8*)(this+0x454) |= 0x1
 *   0x1981fb  popq %rbp ; retq                   ; void
 *
 * Zero callees, no externs — a byte-sized read-modify-write sets bit 0 while
 * preserving the other three bytes of the u32 word at +0x454.
 */
export function HGRasterizer_clearToBlack(self: HGRasterizer): void {
  // 0x1981f4 — orb $0x1, 0x454(%rdi): set low-byte bit 0 while preserving
  // bits 8..31 of the containing u32 flags word.
  self.flags0x454 = (self.flags0x454 | 0x1) >>> 0;
}

/**
 * HGRasterizer::color4f(float r, float g, float b, float a) — sets the
 * rasterizer's CURRENT color (glColor4f-style). It packs the four f32
 * arguments into a single 16-byte SSE lane [r, g, b, a] and stores it at
 * this+0x260. Pure state write; no branches, no calls.
 *
 * @0x1978d0  __ZN12HGRasterizer7color4fEffff
 *
 * Disasm (raw-port/re/disasm/Helium.HGRasterizer.color4f.s):
 *
 *   0x1978d0  pushq  %rbp
 *   0x1978d1  movq   %rsp, %rbp
 *   0x1978d4  insertps $0x10, %xmm1, %xmm0   ; xmm0 = [r, g,   x,   x]  (g -> lane1)
 *   0x1978da  insertps $0x20, %xmm2, %xmm0   ; xmm0 = [r, g,   b,   x]  (b -> lane2)
 *   0x1978e0  insertps $0x30, %xmm3, %xmm0   ; xmm0 = [r, g,   b,   a]  (a -> lane3)
 *   0x1978e6  movaps %xmm0, 0x260(%rdi)      ; this.currentColor = [r,g,b,a]
 *   0x1978ed  popq   %rbp
 *   0x1978ee  retq
 *
 * The four args arrive in xmm0=r, xmm1=g, xmm2=b, xmm3=a. `insertps $imm`
 * with the count-field imm 0x10/0x20/0x30 copies src lane 0 into dst lanes
 * 1/2/3 respectively (leaving dst lane 0 = r). So the packed lane is
 * exactly [r, g, b, a]. Numerics: these are f32 lanes, so each component is
 * wrapped in Math.fround to preserve its exact single-precision identity.
 * @0x260 store: raw-port/re/disasm/Helium.HGRasterizer.color4f.s.
 */
export function HGRasterizer_color4f(
  self: HGRasterizer,
  r: number,
  g: number,
  b: number,
  a: number,
): void {
  // 0x1978d4-0x1978e0 — insertps builds the packed lane [r, g, b, a].
  // 0x1978e6 — movaps store to this+0x260 (OFF_CURRENT_COLOR). f32 lanes.
  self.currentColor = [
    Math.fround(r),
    Math.fround(g),
    Math.fround(b),
    Math.fround(a),
  ];
}

/**
 * HGRasterizer::setLineWidth(float w) — sets the rasterizer's CURRENT line
 * width (glLineWidth-style). Pure state write: one scalar f32 store, no
 * branches, no calls, no clamping.
 *
 * @0x1978c0  __ZN12HGRasterizer12setLineWidthEf
 *
 * FULL DISASM (raw-port/re/disasm/Helium.__ZN12HGRasterizer12setLineWidthEf.s
 * — 7 lines, the whole function):
 *
 *   0x1978c0  pushq  %rbp                  ; frame prologue
 *   0x1978c1  movq   %rsp, %rbp
 *   0x1978c4  movss  %xmm0, 0x258(%rdi)    ; this.lineWidth = w   (SCALAR f32)
 *   0x1978cc  popq   %rbp                  ; frame epilogue
 *   0x1978cd  retq                         ; returns void
 *   0x1978ce  nop                          ; alignment pad — no effect
 *
 * The single float argument arrives in %xmm0 (System-V). `movss` is the SCALAR
 * SINGLE form, so exactly 4 bytes are written and the three neighbouring dwords
 * up to the +0x260 color lane are untouched — contrast `color4f` above, whose
 * `movaps` writes all 16. Numerics: the stored value is an f32, so it is
 * wrapped in Math.fround to preserve its exact single-precision identity, the
 * same treatment color4f gives its four components.
 *
 * The binary does NOT validate, clamp, or reject the value: a negative, zero,
 * infinite or NaN width is stored verbatim, and this port stores it verbatim
 * too (Math.fround preserves NaN and both signed zeroes).
 *
 * ORACLE: verified against the live Helium binary. The symbol is LOCAL
 * (`nm` type `t`), so the harness dlopens Helium under
 * `arch -x86_64 /usr/bin/python3` (the port is transcribed from the x86_64
 * slice) and calls it at `nm -n -arch x86_64` vmaddr 0x1978c0 + the dyld image
 * slide — NOT the bare `nm -n` fct/parity/local_call uses, which reports the
 * ARM64 slice even from a Rosetta process. 2,048 cases on a 0x600-byte
 * noise-filled buffer, with widths drawn from 0, -0, 1, -1, 0.5, FLT_MIN,
 * FLT_MAX, +/-inf, NaN and random floats (1,888 of them NOT exactly
 * representable in f32): 2048/2048 stored the exact 4 bytes this port computes
 * AND left every other byte of the buffer unchanged, which pins both the
 * +0x258 offset and the 4-byte store width, and shows the value is stored
 * verbatim — signed zero, both infinities and NaN all round-trip.
 * NEGATIVE CONTROLS (measured): clamping negatives to 0 -> 968 of 2048 wrong;
 * taking abs(w) -> 984 wrong.
 * WHAT THIS ORACLE CANNOT SEE: removing the `Math.fround` scores 2048/2048
 * too. That is not a gap in the fuzz — it is that the f32 store rounds the
 * value identically, on both sides, so the two spellings are observationally
 * equal at this field. The `Math.fround` is kept because it makes the slot's
 * single-precision identity explicit for anyone reading `lineWidth` back as a
 * JS number (where the f64 residue WOULD show), and because it is the
 * treatment its +0x260 neighbour `color4f` already uses.
 */
export function HGRasterizer_setLineWidth(self: HGRasterizer, w: number): void {
  // 0x1978c4 — movss %xmm0, 0x258(%rdi) (OFF_LINE_WIDTH): one scalar f32 store.
  self.lineWidth = Math.fround(w);
  // 0x1978cd — retq, returns void.
}

/** +0x454 — the u32 rasterizer flags word (see the `flags0x454` field doc for
 *  the bit map and for the getter that proves the width). Read-modify-written
 *  32 bits at a time by enableBlending @0x198237/@0x198240. */
const OFF_RASTERIZER_FLAGS = 0x454;

/** +0x424 — the u32 `HGLBlendMode` slot, stored whole by enableBlending
 *  @0x198246 (`movl %esi, 0x424(%rdi)`). */
const OFF_BLEND_MODE = 0x424;

/**
 * HGRasterizer::enableBlending(HGLBlendMode mode, bool enable) @Helium 0x198230
 *   (__ZN12HGRasterizer14enableBlendingE12HGLBlendModeb)
 *
 * Turns blending on in the rasterizer's flags word and records which blend mode
 * to use. Two stores, no branch, no callee, no extern — the whole function is
 * nine instructions.
 *
 * DECODE (raw-port/re/disasm/Helium.__ZN12HGRasterizer14enableBlendingE12HGLBlendModeb.s):
 *
 *   0x198230  pushq %rbp                     ; frame
 *   0x198231  movq  %rsp, %rbp
 *   0x198234  shll  $0x5, %edx               ; edx = enable << 5      (arg3, the bool)
 *   0x198237  orl   0x454(%rdi), %edx        ; edx |= this->flags     (32-BIT load)
 *   0x19823d  orl   $0x5, %edx               ; edx |= 0x5             (bits 0 and 2)
 *   0x198240  movl  %edx, 0x454(%rdi)        ; this->flags = edx      (32-BIT store)
 *   0x198246  movl  %esi, 0x424(%rdi)        ; this->blendMode = mode (arg2, 32-BIT store)
 *   0x19824c  popq  %rbp
 *   0x19824d  retq                           ; void
 *
 * ARGUMENTS. `%rdi` is `this`, `%esi` is the `HGLBlendMode` enum, and `%dl` is
 * the `bool`. The shift at @0x198234 operates on the FULL `%edx`, so it relies
 * on the caller having zero-extended the bool into the register — which is what
 * the psABI requires of a `bool` argument, and why the port models the argument
 * as a `boolean` contributing exactly 0 or 1.
 *
 * THE ORDER OF THE THREE OR'd TERMS IS THE MACHINE'S, and the port keeps the
 * three steps separate rather than folding them into one expression, because
 * `orl 0x454(%rdi), %edx` is where the OLD flags enter: the method never clears
 * anything. Its counterpart `disableBlending()` @0x198250 is the only clear
 * (`andb $-0x5`, i.e. AND ~0x4 — bit 2 only), so bits 0 and 5 that this method
 * sets are STICKY across a disable.
 *
 * `orl $0x5` SETS BIT 0 AS WELL AS BIT 2, unconditionally. Bit 0 is the bit the
 * landed `clearToBlack()` @0x1981f4 also sets, which means bit 0 cannot be read
 * as "clear to black was requested" alone — enabling blending sets it too. This
 * port records that as an observation of the two instruction streams and does
 * not rename the field or the landed comment: what the bit MEANS needs a reader
 * of it, and the only reader decoded so far (`GetRasterizerFlags()` @0x1a0300)
 * hands the whole word to a caller outside this class.
 *
 * BIT 5 IS THE ARGUMENT, NOT A CONSTANT: `enable` is shifted to 0x20 and OR'd,
 * so `enable=false` leaves bit 5 as it was rather than clearing it. Reading the
 * function as "bit 5 = blending enabled" would be wrong in exactly the case the
 * caller passes false after having passed true.
 *
 * ORACLE — raw-port/re/oracle/HGRasterizer_enableBlending_oracle.py under
 * `arch -x86_64 /usr/bin/python3`: the live LOCAL symbol at slide + 0x198230 is
 * called on a 0xCD-poisoned 0x500-byte arena and compared, per case, against
 * this port driven from the SAME case list — 72 cases over six initial flag
 * words (including 0xffffffff and words with bits 8+ set), both bool values and
 * six mode values (0..3, -1, 0x7fffffff). It compares both stored 32-bit words
 * AND asserts that no other byte of the arena moved, which is what pins the two
 * offsets and the two store widths. All 72 agree. Three mutants of this port
 * are each run through the identical case list and each caught: `<< 5` -> `<< 4`
 * (24 cases disagree), `| 0x5` -> `| 0x4` (48), and ignoring the argument (18).
 */
export function HGRasterizer_enableBlending(
  self: HGRasterizer,
  mode: number,
  enable: boolean,
): void {
  // 0x198234 — shll $0x5, %edx : the bool argument, zero-extended by the caller,
  // shifted into bit 5. `>>> 0` keeps the 32-bit unsigned reading of %edx.
  let edx = ((enable ? 1 : 0) << 5) >>> 0;
  // 0x198237 — orl 0x454(%rdi), %edx : fold in the CURRENT flags word (32-bit
  // load from OFF_RASTERIZER_FLAGS). Nothing is cleared here.
  edx = (edx | self.flags0x454) >>> 0;
  // 0x19823d — orl $0x5, %edx : set bit 0 and bit 2 unconditionally.
  edx = (edx | 0x5) >>> 0;
  // 0x198240 — movl %edx, 0x454(%rdi) : store the whole 32-bit word back.
  self.flags0x454 = edx;
  // 0x198246 — movl %esi, 0x424(%rdi) : store the HGLBlendMode enum, 32 bits,
  // exactly as passed (the machine neither validates nor narrows it).
  self.blendMode0x424 = mode | 0;
  // 0x19824c/0x19824d — epilogue + retq, void.
}
