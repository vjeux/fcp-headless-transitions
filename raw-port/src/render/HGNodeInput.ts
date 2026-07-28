// HGNodeInput.ts - Helium's node-graph "input port" record, faithfully
// transcribed from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGNodeInput.HGNodeInput.s      @0x11ba50  (C1)
//   raw-port/re/disasm/Helium.HGNodeInput.HGNodeInputC2.s    @0x11ba20  (C2)
//   raw-port/re/disasm/Helium.HGNodeInput.~HGNodeInputD1.s   @0x11ba90  (D1)
//   raw-port/re/disasm/Helium.HGNodeInput.~HGNodeInputD2.s   @0x11ba80  (D2)
//
// nm -arch x86_64 Helium (all four are real, distinct addresses - not ICF):
//   000000000011ba20 T __ZN11HGNodeInputC2EP6HGNodei
//   000000000011ba50 T __ZN11HGNodeInputC1EP6HGNodei
//   000000000011ba80 T __ZN11HGNodeInputD2Ev
//   000000000011ba90 T __ZN11HGNodeInputD1Ev
//
// STRUCT LAYOUT (recovered from C1 / C2 initializer writes):
//   Both ctors write the exact same 0x38 (56) bytes of state, in order:
//     mov  %rsi,   (%rdi)          ; @+0x00  HGNode* node   (arg 1)
//     mov  %edx,   0x8(%rdi)       ; @+0x08  int32 index    (arg 2)
//     xorps %xmm0,%xmm0
//     movups %xmm0,0xc(%rdi)       ; @+0x0c  16 bytes zeroed
//     mov  $0x0,   0x1c(%rdi)      ; @+0x1c  int32 = 0
//     lea  _HGRectNull(%rip),%rax
//     movups (%rax),%xmm0
//     movups %xmm0,0x20(%rdi)      ; @+0x20  HGRect  = HGRectNull (16 bytes)
//     mov  $0x0,   0x30(%rdi)      ; @+0x30  8 bytes = 0 (pointer)
//   Total sizeof(HGNodeInput) = 0x38 = 56 bytes.
//
//   Field-by-field, with the type inferences that survive the gate:
//     +0x00  HGNode*  node          (owner node - the constructor argument)
//     +0x08  int32    index         (the input's slot index on that node)
//     +0x0c  (16-byte zeroed block) - four consecutive 32-bit lanes; the
//            xorps/movups pair writes it in one xmm store. Without a load
//            site pinning the interpretation, this could be either a
//            float[4] vec4 default (all 0.0f) or an int32[4] all-zero
//            rectangle-like default. We surface it as an opaque 16-byte
//            zeroed field named `_pad0c_16bytes`. Not yet transcribed
//            interpretation @Helium 0x11ba2a / 0x11ba5a - re-derive from
//            the first load site once a caller reads this field.
//     +0x1c  int32    _pad1c_i32    (initialized to 0; likely a flags or
//                                     enum slot - no read site here)
//     +0x20  HGRect   bounds        (initialized to _HGRectNull;
//                                     matches the shape of the store)
//     +0x30  pointer  _pad30_ptr    (nullptr; caller likely fills later)
//
//   The two "unknown-interp" pads (@+0x0c and @+0x1c and @+0x30) are
//   NOT invented state - the constructor demonstrably writes them; we
//   just don't yet know the semantic types. We keep them typed and
//   defaulted exactly the way the ctor initializes them, and mark them
//   with "not yet transcribed" doc-strings so future ports of the reader
//   sites can rename in place without changing the byte-level shape.
//
// DESTRUCTORS: both D1 @0x11ba90 and D2 @0x11ba80 are pure returns
// (pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq). No members require
// cleanup. Under GC/TS these are elided - we do not model them as
// methods, only document them for completeness.
//
// FRONTIER: HGNode - the type of the +0x00 field. Not ported yet;
// treated as an opaque forward reference. Not yet transcribed class
// @Helium (constructor's %rsi param).

import { HGRect, HGRectNull } from "./HGRect";

/** Opaque forward reference for HGNode - the owner node whose pointer
 *  the constructor stores at +0x00. Full class not yet transcribed
 *  @Helium (HGNodeInput's ctor arg 1). */
export type HGNode = unknown;

/** HGNodeInput - a "one input port" record on a node-graph node.
 *  Layout exactly mirrors the 56-byte C++ struct the C1/C2 ctors
 *  produce; fields are in disassembly order and named accordingly. */
export class HGNodeInput {
  /** +0x00 - HGNode* node (ctor arg 1, %rsi). */
  node: HGNode;
  /** +0x08 - int32 index (ctor arg 2, %edx). */
  index: number;
  /** +0x0c - 16 zeroed bytes written by `xorps %xmm0,%xmm0 ; movups %xmm0,0xc(%rdi)`.
   *  Semantic interpretation not yet transcribed @Helium 0x11ba2a /
   *  0x11ba5a (could be vec4<f32>, int32[4], or two 8-byte pointers).
   *  Kept as a 4-lane int32 tuple defaulted to all zero so the byte
   *  shape matches the ctor exactly. */
  _pad0c_16bytes: [number, number, number, number];
  /** +0x1c - int32 initialized to 0 (`mov $0x0, 0x1c(%rdi)`).
   *  Semantic not yet transcribed @Helium 0x11ba31 / 0x11ba61. */
  _pad1c_i32: number;
  /** +0x20 - HGRect initialized to _HGRectNull (16 bytes copied from
   *  the `_HGRectNull` data symbol via `movups`). */
  bounds: HGRect;
  /** +0x30 - 8 bytes = 0 written by `movq $0x0, 0x30(%rdi)`. Almost
   *  certainly a pointer (aligned qword store, immediate zero, mirrors
   *  the typical initialize-owned-ptr-to-null pattern). Semantic name
   *  not yet transcribed @Helium 0x11ba46 / 0x11ba76. */
  _pad30_ptr: null;

  /**
   * HGNodeInput(HGNode* node, int index) - @Helium 0x11ba50 (C1) / 0x11ba20 (C2).
   *
   * Both C1 and C2 have byte-identical bodies (the linker did NOT ICF
   * them - they're at distinct addresses - but the compiler emitted the
   * same code for the "complete-object" and "base-object" ctors because
   * HGNodeInput has no virtual bases). Faithful transcription of C1:
   *   pushq  %rbp
   *   movq   %rsp,%rbp
   *   movq   %rsi,(%rdi)                    ; @+0x00 = node
   *   movl   %edx,0x8(%rdi)                 ; @+0x08 = index
   *   xorps  %xmm0,%xmm0
   *   movups %xmm0,0xc(%rdi)                ; @+0x0c = 0,0,0,0 (16 bytes)
   *   movl   $0x0,0x1c(%rdi)                ; @+0x1c = 0
   *   leaq   _HGRectNull(%rip),%rax
   *   movups (%rax),%xmm0
   *   movups %xmm0,0x20(%rdi)               ; @+0x20 = HGRectNull
   *   movq   $0x0,0x30(%rdi)                ; @+0x30 = null
   *   popq   %rbp
   *   retq
   *
   * @param node  HGNode* - the owning node.
   * @param index int    - the input slot index on that node.
   */
  constructor(node: HGNode, index: number) {
    // @0x11ba54 / 0x11ba24  mov %rsi,(%rdi)
    this.node = node;
    // @0x11ba57 / 0x11ba27  mov %edx,0x8(%rdi)
    // Force int32 semantics on `index` since %edx is a 32-bit signed slot.
    this.index = index | 0;
    // @0x11ba5a-0x11ba5d / 0x11ba2a-0x11ba2d  xorps xmm0 ; movups xmm0,0xc(%rdi)
    this._pad0c_16bytes = [0, 0, 0, 0];
    // @0x11ba61 / 0x11ba31  movl $0x0, 0x1c(%rdi)
    this._pad1c_i32 = 0;
    // @0x11ba68-0x11ba72 / 0x11ba38-0x11ba42
    //   leaq _HGRectNull(%rip),%rax ; movups (%rax),%xmm0 ; movups %xmm0,0x20(%rdi)
    // Deep-copy the HGRectNull literal so mutations here don't touch the
    // shared singleton (the asm's `movups` is a 16-byte value copy, not
    // a pointer alias).
    this.bounds = {
      x: HGRectNull.x,
      y: HGRectNull.y,
      right: HGRectNull.right,
      bottom: HGRectNull.bottom,
    };
    // @0x11ba76 / 0x11ba46  movq $0x0, 0x30(%rdi)
    this._pad30_ptr = null;
  }

  /**
   * Destructors D1 @Helium 0x11ba90 and D2 @Helium 0x11ba80 are both
   * trivial no-ops (pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq). No
   * cleanup is required - none of the +0x00/+0x30 pointers are owned by
   * this class (the HGNode* at +0x00 is a back-reference, and the
   * +0x30 pointer is only ever null in the initialized state). Under
   * GC/TS the destructor pair is unobservable, so we do not model it
   * as a method.
   */
}
