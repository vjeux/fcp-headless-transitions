// HGGLContextPtr — Helium framework OpenGL-context pointer wrapper.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (x86_64 slice, unadjusted VAs).
//
// This file ports ONLY the method listed under "Symbols ported here". Every
// other HGGLContextPtr method is a separate ledger entry, added to THIS file
// (additive extension only) when claimed — never a rewrite/drop of a landed one.
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * HGGLContextPtr::HGGLContextPtr(void*)   @Helium 0x1b3930   (C1 ctor)
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZN14HGGLContextPtrC1EPv.s   (7 lines)
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered fully from this ctor)
// -----------------------------------------------------------------------------
// HGGLContextPtr {
//   void* ctx;   // +0x00 — the raw context pointer. The ctor stores its
//                //   single void* argument straight here:
//                //     movq %rsi, (%rdi)   @0x1b3934
//                //   This is a thin single-pointer wrapper (a "smart pointer"
//                //   whose only state is the wrapped GL-context handle).
// }

/**
 * HGGLContextPtr — a thin wrapper holding one raw OpenGL-context pointer.
 * Modelled as an opaque handle: the wrapped `ctx` is an out-of-scope
 * platform OpenGL/CGL context object, so we hold it as `unknown`.
 */
export interface HGGLContextPtr_Fields {
  // +0x00 : the wrapped raw context pointer (opaque platform handle, or null).
  ctx_at0x00: unknown;
}

/**
 * HGGLContextPtr::HGGLContextPtr(void* ctx)   [C1 complete-object ctor]
 * @0x00000000001b3930  Helium   mangled: __ZN14HGGLContextPtrC1EPv
 *
 * ABI: %rdi = this, %rsi = void* ctx argument.
 *
 * Disasm (full):
 *   pushq %rbp              # @0x1b3930
 *   movq  %rsp, %rbp        # @0x1b3931
 *   movq  %rsi, (%rdi)      # @0x1b3934  this->ctx = ctx
 *   popq  %rbp              # @0x1b3937
 *   retq                    # @0x1b3938
 *   nopl  (%rax)            # @0x1b3939  padding
 *
 * Net effect: store the void* argument into this+0x0. No callees, no branches.
 */
export function HGGLContextPtr_ctor(
  self: HGGLContextPtr_Fields,
  ctx: unknown,
): void {
  // movq %rsi, (%rdi)  @0x1b3934 — plain single-word store of the argument.
  self.ctx_at0x00 = ctx;
}
