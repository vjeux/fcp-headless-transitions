// raw-port: HGCGL — Helium framework (render layer)
//
// Four static functions that query Apple CGL (Core OpenGL) attributes/parameters
// for a given HGGLContextPtr. All four are thin marshalling wrappers around the
// Mac-only CGL C API (CGLGetPixelFormat / CGLDescribePixelFormat / CGLGetParameter).
// In the TypeScript raw-port these have no in-process CGL runtime, so every body
// preserves the exact asm control flow and throws at the frontier (the CGL stub
// call) — citing the callee address on the throw line.
//
// SYMBOLS PORTED (Helium.framework/Versions/A/Helium):
//   @Helium 0x14edb0  HGCGL::ContextIsAccelerated(HGGLContextPtr ctx, int virtualScreen) -> bool
//   @Helium 0x14edf0  HGCGL::ContextRendererID  (HGGLContextPtr ctx, int virtualScreen) -> int
//   @Helium 0x14ee30  HGCGL::NumVirtualScreens  (HGGLContextPtr ctx)                    -> int
//   @Helium 0x14ee90  HGCGL::GetCurrentRendererID(HGGLContextPtr ctx)                   -> int
//
// re/disasm:
//   raw-port/re/disasm/Helium.HGCGL.ContextIsAccelerated.s
//   raw-port/re/disasm/Helium.HGCGL.ContextRendererID.s
//   raw-port/re/disasm/Helium.HGCGL.NumVirtualScreens.s
//   raw-port/re/disasm/Helium.HGCGL.GetCurrentRendererID.s
//
// FRONTIER CALLEES (external / undecoded):
//   __ZNK14HGGLContextPtr3ptrEv                         — HGGLContextPtr::ptr() const  (member accessor
//                                                          returning the underlying CGLContextObj)
//   __stub _CGLGetPixelFormat        @Helium 0x3c4c5e   — CGL C API: CGLPixelFormatObj CGLGetPixelFormat(CGLContextObj)
//   __stub _CGLDescribePixelFormat   @Helium 0x3c4c3a   — CGL C API: CGLError CGLDescribePixelFormat(
//                                                          CGLPixelFormatObj pix, GLint pix_num,
//                                                          CGLPixelFormatAttribute attrib, GLint *value)
//   __stub _CGLGetParameter          @Helium 0x3c4c58   — CGL C API: CGLError CGLGetParameter(
//                                                          CGLContextObj, CGLContextParameter, GLint *value)
//
// CGL ATTRIBUTE/PARAMETER CONSTANTS (from Apple OpenGL/CGLTypes.h; matched to the
// asm-immediate values below):
//   0x46  = kCGLPFARendererID           (CGLPixelFormatAttribute)
//   0x49  = kCGLPFAAccelerated          (CGLPixelFormatAttribute)
//   0x80  = kCGLPFAVirtualScreenCount   (CGLPixelFormatAttribute)
//   0x135 = kCGLCPCurrentRendererID     (CGLContextParameter)  (imm = 0x135 in GetCurrentRendererID)
//
// This is a foreign-runtime boundary: TypeScript running outside macOS has no
// CGLContextObj, no CGLPixelFormatObj, and no way to satisfy CGLDescribePixelFormat.
// Each method mirrors the asm faithfully; the external stub sites throw with
// their @0xADDR so consumers see the exact frontier that would need to be wired
// to a native CGL binding to become functional.
//
// Conventions:
//   - HGGLContextPtr is opaque in the port; we type it as `unknown` and route
//     through the ptr() accessor stub. Real code would import a concrete class.
//   - int32 return values are stored/read using |0 to preserve GLint width.
//   - Booleans mirror `setne %al` (nonzero-value semantics).

// ---------------------------------------------------------------------------
// Frontier stubs (external symbols; not decoded in this port).
// Kept private to this module so the ONE class-per-file rule holds for HGCGL.
// ---------------------------------------------------------------------------

/** __ZNK14HGGLContextPtr3ptrEv — HGGLContextPtr::ptr() const.
 *  Member accessor returning the underlying CGLContextObj. Not yet transcribed
 *  (belongs to HGGLContextPtr, a separate class). @Helium 0x14edb8 (call site)
 */
function HGGLContextPtr_ptr(_ctx: unknown): unknown {
  throw new Error(
    "HGGLContextPtr::ptr() const not yet transcribed — external accessor (see @0x14edb8 call site)",
  );
}

/** __stub _CGLGetPixelFormat @Helium 0x3c4c5e.
 *  Apple CGL C API — returns the CGLPixelFormatObj bound to a CGLContextObj.
 *  No JS equivalent; would require a native macOS binding.
 */
function CGLGetPixelFormat(_ctx: unknown): unknown {
  throw new Error(
    "_CGLGetPixelFormat stub not yet transcribed — Apple CGL C API (see @0x3c4c5e stub)",
  );
}

/** __stub _CGLDescribePixelFormat @Helium 0x3c4c3a.
 *  Apple CGL C API — retrieves the value of a CGLPixelFormatAttribute for the
 *  given virtual-screen index into out[0]. Returns a CGLError (0 on success).
 */
function CGLDescribePixelFormat(
  _pix: unknown,
  _pixNum: number,
  _attrib: number,
  _out: Int32Array,
): number {
  throw new Error(
    "_CGLDescribePixelFormat stub not yet transcribed — Apple CGL C API (see @0x3c4c3a stub)",
  );
}

/** __stub _CGLGetParameter @Helium 0x3c4c58.
 *  Apple CGL C API — reads a per-context integer parameter into out[0].
 */
function CGLGetParameter(
  _ctx: unknown,
  _param: number,
  _out: Int32Array,
): number {
  throw new Error(
    "_CGLGetParameter stub not yet transcribed — Apple CGL C API (see @0x3c4c58 stub)",
  );
}

// CGLPixelFormatAttribute / CGLContextParameter immediates matched to asm.
const kCGLPFARendererID = 0x46;
const kCGLPFAAccelerated = 0x49;
const kCGLPFAVirtualScreenCount = 0x80;
const kCGLCPCurrentRendererID = 0x135;

/**
 * HGCGL — static-only namespace class (no instance state; C++ side has all
 * four members as free-function-shaped statics under the HGCGL namespace).
 */
export class HGCGL {
  /**
   * HGCGL::ContextIsAccelerated(HGGLContextPtr ctx, int virtualScreen) -> bool
   * @Helium 0x14edb0
   *
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax          @0x14edb0
   *   movl %esi,%ebx                                              @0x14edb6  ; ebx = virtualScreen
   *   callq HGGLContextPtr::ptr()                                 @0x14edb8
   *   movq %rax,%rdi                                              @0x14edbd
   *   callq _CGLGetPixelFormat                                    @0x14edc0  ; rax = CGLPixelFormatObj
   *   leaq -0xc(%rbp),%rcx                                        @0x14edc5  ; rcx = &out (GLint)
   *   movq %rax,%rdi; movl %ebx,%esi; movl $0x49,%edx             @0x14edc9  ; kCGLPFAAccelerated
   *   callq _CGLDescribePixelFormat                               @0x14edd3
   *   cmpl $0x0,-0xc(%rbp); setne %al                             @0x14edd8  ; return out != 0
   */
  static ContextIsAccelerated(ctx: unknown, virtualScreen: number): boolean {
    // @0x14edb6: ebx = virtualScreen (i32)
    const ebx = virtualScreen | 0;
    // @0x14edb8: rax = HGGLContextPtr::ptr()
    const cglCtx = HGGLContextPtr_ptr(ctx);
    // @0x14edc0: rax = _CGLGetPixelFormat(rax)
    const pix = CGLGetPixelFormat(cglCtx);
    // @0x14edc5: out slot on stack
    const out = new Int32Array(1);
    // @0x14edd3: _CGLDescribePixelFormat(pix, virtualScreen, kCGLPFAAccelerated, &out)
    CGLDescribePixelFormat(pix, ebx, kCGLPFAAccelerated, out);
    // @0x14edd8: cmpl $0,out; setne %al  -> return out != 0
    return out[0] !== 0;
  }

  /**
   * HGCGL::ContextRendererID(HGGLContextPtr ctx, int virtualScreen) -> int
   * @Helium 0x14edf0
   *
   *   Same shape as ContextIsAccelerated but attrib = 0x46 (kCGLPFARendererID)
   *   and the return is the raw i32 stored into -0xc(%rbp), not a boolean.
   *
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax           @0x14edf0
   *   movl %esi,%ebx                                               @0x14edf6
   *   callq HGGLContextPtr::ptr()                                  @0x14edf8
   *   movq %rax,%rdi; callq _CGLGetPixelFormat                     @0x14edfd..0x14ee00
   *   leaq -0xc(%rbp),%rcx                                         @0x14ee05
   *   movq %rax,%rdi; movl %ebx,%esi; movl $0x46,%edx              @0x14ee09  ; kCGLPFARendererID
   *   callq _CGLDescribePixelFormat                                @0x14ee13
   *   movl -0xc(%rbp),%eax                                         @0x14ee18  ; return out
   */
  static ContextRendererID(ctx: unknown, virtualScreen: number): number {
    // @0x14edf6
    const ebx = virtualScreen | 0;
    // @0x14edf8
    const cglCtx = HGGLContextPtr_ptr(ctx);
    // @0x14edfd..0x14ee00
    const pix = CGLGetPixelFormat(cglCtx);
    // @0x14ee05
    const out = new Int32Array(1);
    // @0x14ee13
    CGLDescribePixelFormat(pix, ebx, kCGLPFARendererID, out);
    // @0x14ee18: movl -0xc(%rbp),%eax
    return out[0] | 0;
  }

  /**
   * HGCGL::NumVirtualScreens(HGGLContextPtr ctx) -> int
   * @Helium 0x14ee30
   *
   *   Guards against a null ctx AND a null pixel format before calling
   *   _CGLDescribePixelFormat; on either null path returns 0.
   *
   *   movq %rdi,%r14                                                @0x14ee3b  ; save &ctx
   *   movl $0x0,-0x14(%rbp)                                         @0x14ee3e  ; out = 0
   *   callq HGGLContextPtr::ptr()                                   @0x14ee45
   *   xorl %ebx,%ebx                                                @0x14ee4a  ; result = 0
   *   testq %rax,%rax; je .Lreturn                                  @0x14ee4c..0x14ee4f
   *   movq %r14,%rdi; callq HGGLContextPtr::ptr()                   @0x14ee51..0x14ee54
   *   movq %rax,%rdi; callq _CGLGetPixelFormat                      @0x14ee59..0x14ee5c
   *   testq %rax,%rax; je .Lreturn                                  @0x14ee61..0x14ee64
   *   leaq -0x14(%rbp),%rcx                                         @0x14ee66
   *   movq %rax,%rdi; xorl %esi,%esi; movl $0x80,%edx               @0x14ee6a  ; pix_num=0, kCGLPFAVirtualScreenCount
   *   callq _CGLDescribePixelFormat                                 @0x14ee74
   *   movl -0x14(%rbp),%ebx                                         @0x14ee79  ; result = out
   *   .Lreturn: movl %ebx,%eax                                      @0x14ee7c
   *
   *   Note the call-twice-then-null-check pattern: the first ptr() is used
   *   only for the null test; the second (same) call is used to feed
   *   _CGLGetPixelFormat. The port mirrors both calls exactly (idempotent for
   *   a member accessor, but preserved to match the asm).
   */
  static NumVirtualScreens(ctx: unknown): number {
    // @0x14ee3e: out = 0
    const out = new Int32Array(1);
    // @0x14ee4a: result = 0
    let ebx = 0;
    // @0x14ee45: rax = HGGLContextPtr::ptr()
    const p0 = HGGLContextPtr_ptr(ctx);
    // @0x14ee4c..0x14ee4f: if (rax == 0) goto .Lreturn
    if (p0 !== null && p0 !== undefined) {
      // @0x14ee51..0x14ee54: rax = HGGLContextPtr::ptr()  (called again)
      const p1 = HGGLContextPtr_ptr(ctx);
      // @0x14ee59..0x14ee5c: rax = _CGLGetPixelFormat(rax)
      const pix = CGLGetPixelFormat(p1);
      // @0x14ee61..0x14ee64: if (rax == 0) goto .Lreturn
      if (pix !== null && pix !== undefined) {
        // @0x14ee74: _CGLDescribePixelFormat(pix, 0, kCGLPFAVirtualScreenCount, &out)
        CGLDescribePixelFormat(pix, 0, kCGLPFAVirtualScreenCount, out);
        // @0x14ee79: result = out
        ebx = out[0] | 0;
      }
    }
    // @0x14ee7c: movl %ebx,%eax
    return ebx | 0;
  }

  /**
   * HGCGL::GetCurrentRendererID(HGGLContextPtr ctx) -> int
   * @Helium 0x14ee90
   *
   *   pushq %rbp; movq %rsp,%rbp; subq $0x10,%rsp                    @0x14ee90
   *   callq HGGLContextPtr::ptr()                                    @0x14ee98
   *   leaq -0x4(%rbp),%rdx                                           @0x14ee9d
   *   movq %rax,%rdi; movl $0x135,%esi                               @0x14eea1  ; kCGLCPCurrentRendererID
   *   callq _CGLGetParameter                                         @0x14eea9
   *   movl -0x4(%rbp),%eax                                           @0x14eeae
   *
   *   No null-check on the ptr — mirrors asm verbatim.
   */
  static GetCurrentRendererID(ctx: unknown): number {
    // @0x14ee98
    const cglCtx = HGGLContextPtr_ptr(ctx);
    // @0x14ee9d: &out (GLint) in rdx
    const out = new Int32Array(1);
    // @0x14eea9: _CGLGetParameter(rdi=ctx, esi=kCGLCPCurrentRendererID, rdx=&out)
    CGLGetParameter(cglCtx, kCGLCPCurrentRendererID, out);
    // @0x14eeae: movl -0x4(%rbp),%eax
    return out[0] | 0;
  }
}
