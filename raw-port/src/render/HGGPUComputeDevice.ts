// HGGPUComputeDevice.ts — Helium framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * HGGPUComputeDevice::GetGLVirtualScreen() const           @Helium 0x117720
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZNK18HGGPUComputeDevice18GetGLVirtualScreenEv.s
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (external / undecoded — all Apple CoreOpenGL C API)
// -----------------------------------------------------------------------------
//   __stub _CGLQueryRendererInfo    @Helium 0x3c4c70
//       CGLError CGLQueryRendererInfo(GLuint display_mask,
//                                     CGLRendererInfoObj *rend,
//                                     GLint *nrend)
//   __stub _CGLDescribeRenderer     @Helium 0x3c4c40
//       CGLError CGLDescribeRenderer(CGLRendererInfoObj rend,
//                                    GLint rend_num,
//                                    CGLRendererProperty prop,
//                                    GLint *value)
//   __stub _CGLChoosePixelFormat    @Helium 0x3c4c2e
//       CGLError CGLChoosePixelFormat(const CGLPixelFormatAttribute *attribs,
//                                     CGLPixelFormatObj *pix, GLint *npix)
//   __stub _CGLDescribePixelFormat  @Helium 0x3c4c3a
//       CGLError CGLDescribePixelFormat(CGLPixelFormatObj pix, GLint pix_num,
//                                       CGLPixelFormatAttribute attrib,
//                                       GLint *value)
//   __stub _CGLDestroyRendererInfo  @Helium 0x3c4c4c
//   __stub _CGLDestroyPixelFormat   @Helium 0x3c4c46
//   __stub ___stack_chk_fail        @Helium 0x3c5030   (irrelevant to value port)
//
// These are Apple OpenGL C entry points (macOS-only). No in-scope FCP callee is
// invoked from this function, so every non-native call surfaces as a throwing
// boundary stub citing its @0xADDR — the "true out-of-scope extern" rule.
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT (from disasm alone)
// -----------------------------------------------------------------------------
//   0x68  uint64  targetKey — packed (kCGLRPRendererID(hi<<32) | kCGLRPDeviceRegistryIDLow(lo))
//                             set by higher-level code (e.g. a metal/gpu selection path);
//                             read at line 0x11774e (`movq 0x68(%rdi), %r13`) and later
//                             compared against every renderer at 0x1177d3.
//   0x70  int32   _glVirtualScreen — cached CGL virtual-screen index; sentinel `-1`
//                                   (`cmpl $-1,%eax` @0x117742) means "not yet computed".
//                                   Cleared to 0xFFFFFFFF at 0x117823 before the pixel-format
//                                   loop tries to fill it in.
//
// -----------------------------------------------------------------------------
// FUNCTION BEHAVIOUR — line-by-line decode
// -----------------------------------------------------------------------------
// If the cache at +0x70 is not -1, return it directly (fast path @0x117742 taken to
// the epilogue @0x1178bd).
//
// Otherwise:
//  A. Enumerate renderers with `_CGLQueryRendererInfo(0xFFFFFFFF, &info, &n)` at
//     0x11776e. Displayed mask 0xFFFFFFFF asks CGL for all displays.
//  B. Set local `displayMask = 0` (@0x117773, `movl $0, -0x70(%rbp)`).
//  C. For each renderer index `r14` in [0, n):
//       * hi = CGLDescribeRenderer(info, r14, 0x8d /*kCGLRPRendererID*/, &_)
//       * lo = CGLDescribeRenderer(info, r14, 0x8c /*kCGLRPDeviceRegistryIDLow*/, &_)
//       * pack (hi << 32) | (lo & 0xFFFFFFFF), compare to this->targetKey (+0x68).
//       * On match, CGLDescribeRenderer(info, r14, 0x46, &displayMask) and break.
//  D. Build a 20-byte CGLPixelFormatAttribute array on stack:
//       bytes[0..15] = 16-byte constant loaded from `0x2bdfb1(%rip)` @ instruction
//                      0x1177f8  (RIP-relative target = 0x1177ff + 0x2bdfb1 = 0x3d5fb0);
//                      this template is `{ kCGLPFADisplayMask (0x32=50), displayMaskAttrValue,
//                                          kCGLPFARendererID  (0x46=70), 0 }` — the middle
//                      slot is patched below.
//       bytes[16..19] = 0 (terminator, `movl $0,-0x40(%rbp)`).
//     Note the ASM writes the constant BEFORE placing `displayMask` into it — the
//     constant already has `displayMask` in the correct slot? No: it also does
//     `movq $0, -0x58(%rbp)` which zeroes the CGLPixelFormatObj out-pointer AND
//     also serves as the second attribute slot value in the template's 2nd u32.
//     Actually -0x58 is a SEPARATE local (the CGLPixelFormatObj*), not part of
//     the attrib list. So the 16-byte constant is the full 4-attr template, and
//     _CGLChoosePixelFormat is called with (&attribs, &pixObj, &npix).
//  E. Blindly stamp `this->_glVirtualScreen = -1` (@0x117823) — clears any prior
//     value even if the loop below finds a match.
//  F. If npix > 0, iterate pixel formats:
//       * CGLDescribePixelFormat(pix, i, 0x46 /*kCGLPFARendererID*/, &v)
//       * If v == displayMask -> match; store `i` into this->_glVirtualScreen,
//         then CGLDescribePixelFormat(pix, i, 0x54, &accelerated) — if nonzero,
//         probe with CGLQueryRendererInfo(0, ...) + CGLDestroyRendererInfo (this
//         second query drops its result immediately; likely a warm/prime effect
//         mirroring what higher-level FCP does elsewhere).
//     Break out of the loop on match.
//  G. Destroy the pixel format (0x3c4c46) then the renderer info (0x3c4c4c).
//  H. Return `this->_glVirtualScreen`.
//
// The whole body runs UNDER a stack canary — this port omits the canary check;
// it is not observable in the return value.
//
// -----------------------------------------------------------------------------
// PORT STRATEGY
// -----------------------------------------------------------------------------
// TypeScript running outside macOS has no CGLContextObj, no renderer info, no
// pixel formats. The port models the boundary: it reads the cached
// `_glVirtualScreen` field and returns it immediately when set; on the slow
// path (uncached) it throws at the FIRST CGL frontier — `_CGLQueryRendererInfo
// @0x3c4c70` — citing that stub address. Later, whoever wires a native CGL
// binding replaces that throw with a real call; the surrounding decode is
// already correct.

// Attribute constants (Apple OpenGL/CGLTypes.h, matched to asm immediates):
export const kCGLRPRendererID          = 0x8d; // @Helium 0x1177a5   movl $0x8d,%edx (arg3 of CGLDescribeRenderer)
export const kCGLRPDeviceRegistryIDLow = 0x8c; // @Helium 0x1177b9
export const kCGLRPDisplayMask         = 0x46; // @Helium 0x1177ee   used to pull the renderer's display mask
export const kCGLPFARendererID_PF      = 0x46; // @Helium 0x117847   as CGLPixelFormatAttribute in DescribePixelFormat
export const kCGLPFAAcceleratedProbe   = 0x54; // @Helium 0x117876   attr queried to decide the warm-up CGLQueryRendererInfo(0)

/** Opaque handle for the C++ HGGPUComputeDevice instance layout. */
export interface HGGPUComputeDeviceState {
  /** +0x68  packed (kCGLRPRendererID<<32) | kCGLRPDeviceRegistryIDLow — the target
   *  renderer key this device wants to find in the CGL virtual-screen table. */
  targetKey: bigint;
  /** +0x70  cached CGL virtual-screen index; -1 (0xFFFFFFFF) means unresolved. */
  _glVirtualScreen: number;
}

/**
 * HGGPUComputeDevice::GetGLVirtualScreen() const   @Helium 0x117720
 *
 * Returns the cached CGL virtual-screen index for this device. If the cache is
 * unset (`_glVirtualScreen == -1`), the original code enumerates CGL renderers
 * with `_CGLQueryRendererInfo` / `_CGLDescribeRenderer`, locates the one whose
 * packed (rendererID, deviceRegistryIDLow) matches `+0x68`, then runs
 * `_CGLChoosePixelFormat` and iterates the resulting pixel formats to find the
 * matching virtual-screen index. Every step is an Apple CGL C API extern —
 * the port throws at the first frontier citing its @0xADDR.
 */
export function HGGPUComputeDevice_GetGLVirtualScreen(
  self: HGGPUComputeDeviceState,
): number {
  // 0x11773f  movl 0x70(%rdi), %eax
  // 0x117742  cmpl $-0x1, %eax
  // 0x117745  jne  0x1178bd     ; fast-path return if cached
  const cached = self._glVirtualScreen | 0;
  if (cached !== -1) {
    // 0x1178ba  movl 0x70(%rbx), %eax ; 0x1178cd  addq $0x68,%rsp ; ... ; retq
    return cached;
  }

  // 0x117752  movq $0, -0x68(%rbp)   ; local CGLRendererInfoObj info = NULL
  // 0x11775a  movl $0, -0x5c(%rbp)   ; local GLint nRend = 0
  // 0x117769  movl $0xffffffff,%edi  ; display_mask = 0xFFFFFFFF (all displays)
  // 0x11776e  callq _CGLQueryRendererInfo
  //
  // First CGL extern in the slow path: this is the frontier. On a real macOS
  // build with a CGL binding this would populate `info` and `nRend`; the port
  // has no such binding, so we throw with the stub's exact stub-table address.
  throw new Error(
    "_CGLQueryRendererInfo @Helium __stubs 0x3c4c70 not yet transcribed " +
      "(HGGPUComputeDevice::GetGLVirtualScreen slow path, targetKey=" +
      self.targetKey.toString(16) + ")",
  );

  // ---------------------------------------------------------------------------
  // Remaining decoded control-flow, kept as documentation for the wiring pass
  // that supplies the CGL binding. It is intentionally UNREACHABLE — the throw
  // above is the current frontier.
  // ---------------------------------------------------------------------------
  //
  //  0x117773  movl $0, -0x70(%rbp)                       ; displayMask = 0
  //  0x11777a  cmpl $0, -0x5c(%rbp) ; jle 0x1177f8         ; skip loop if nRend<=0
  //  0x117780..0x1177e1  for (r14=0; r14<nRend; ++r14) {
  //     0x1177ad  CGLDescribeRenderer(info, r14, 0x8d, &hi)
  //     0x1177c1  CGLDescribeRenderer(info, r14, 0x8c, &lo)
  //     packed = ((uint64)hi << 32) | (uint32)lo
  //     if (packed == self.targetKey) {                  ; 0x1177d3  cmpq %r13,%rcx ; je
  //         CGLDescribeRenderer(info, r14, 0x46, &displayMask)  ; 0x1177f3
  //         break
  //     }
  //  }
  //  0x1177f8..0x117812                                       ; build attrib list
  //     movaps 0x2bdfb1(%rip), %xmm0                       ; RIP target = 0x3d5fb0
  //     movaps %xmm0, -0x50(%rbp)                          ; attribs[0..3] template
  //     movl   $0, -0x40(%rbp)                             ; attribs[4] terminator
  //     movq   $0, -0x58(%rbp)                             ; CGLPixelFormatObj = NULL
  //  0x11781e  callq _CGLChoosePixelFormat(&attribs, &pixObj, &npix)
  //  0x117823  movl $0xffffffff, 0x70(%rbx)                ; _glVirtualScreen = -1 (clear)
  //  0x11782a  cmpl $0, -0x6c(%rbp) ; jle 0x1178a8          ; skip loop if npix<=0
  //  0x117830..0x117865  for (r14=0; r14<npix; ++r14) {
  //     0x11784f  CGLDescribePixelFormat(pix, r14, 0x46, &v)
  //     if (v == displayMask) {                            ; 0x117857  cmpl -0x70(%rbp),%eax
  //         self._glVirtualScreen = r14                    ; 0x117867  movl %r14d, 0x70(%rbx)
  //         CGLDescribePixelFormat(pix, r14, 0x54, &acc)   ; 0x11787b
  //         if (acc != 0) {                                 ; 0x117883  testl %edi,%edi
  //             CGLQueryRendererInfo(0, &tmp, &tmpN)        ; 0x11789a
  //             CGLDestroyRendererInfo(tmp)                 ; 0x1178a3
  //         }
  //         break
  //     }
  //  }
  //  0x1178a8  CGLDestroyPixelFormat(pix)
  //  0x1178b1  CGLDestroyRendererInfo(info)
  //  0x1178ba  return self._glVirtualScreen
}
