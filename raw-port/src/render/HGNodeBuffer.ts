// HGNodeBuffer — Helium framework
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium (x86_64 slice).
//
// Class layout summary (from ReadTile disasm):
//   +0x80 : some pointer used as first arg to HGExecutionUnit::RenderTile (looks like HGNodeBuffer's own
//           output surface pointer, passed as `float vector[4]*`). Read into %r8 @0x153fb0.
//   +0x88 : HGNode* — the source node whose tile is being read; also holds two integer scratch fields
//           at inner offsets +0x24 (an int) and +0x70 (an int) that ReadTile stashes across the
//           RenderTile call. @0x153fb7.
//
// Instance methods on this class:
//   0x00153f50  HGNodeBuffer(HGNode*, HGRect, HGFormat, HGExecutionUnit*)  — ctor (ICF-folded / no body label)
//   0x00153fa0  ReadTile(void*, HGRect, int)
//   0x00157390  ~HGNodeBuffer() [D1] — delegates to HGBuffer::~HGBuffer
//   0x001573a0  ~HGNodeBuffer() [D0] — delegating dtor + HGObject::operator delete
//   0x001573c0  WriteTile(void const*, HGRect) — empty body (pushq %rbp; popq %rbp; retq).

/* eslint-disable @typescript-eslint/no-unused-vars */

import type { HGRect } from './HGRect';

// Frontier / not-yet-ported base types this class refers to. Kept as opaque
// TS types so we do not invent shape; imports become real once those classes
// are transcribed by the swarm.
// - HGBuffer            (base class; provides D2 destructor called from D1/D0 @0x157395, @0x1573a9)
// - HGNode              (source node stored at +0x88)
// - HGExecutionUnit     (called into for RenderTile @0x153fc6)
// - HGFormat            (constructor argument at @0x153f50; enum-like tag)
// - HGObject            (base allocation surface; operator delete jmp'd @0x1573b7)
export type HGBuffer = unknown;
export type HGNode = unknown;
export type HGExecutionUnit = unknown;
export type HGFormat = unknown;

/**
 * HGNodeBuffer wraps an HGNode plus a render-target surface so that reads of a
 * rectangular tile go through the node's HGExecutionUnit rendering path.
 *
 * @class HGNodeBuffer  (Helium)
 * @extends HGBuffer   (vtable set by HGBuffer's ctor; ICF-folded here)
 */
export class HGNodeBuffer {
  // Field mirror of the C++ layout that ReadTile touches. We keep only the
  // slots we actually observed being used; the rest belongs to HGBuffer.

  /** +0x80 — output surface pointer (passed as `float vector[4]*` to RenderTile) @0x153fb0 */
  public surface_0x80: unknown = null;

  /** +0x88 — HGNode* whose tile we render @0x153fb7 */
  public node_0x88: HGNode | null = null;

  /**
   * HGNodeBuffer::HGNodeBuffer(HGNode*, HGRect, HGFormat, HGExecutionUnit*) @0x00153f50
   *
   * The body is ICF-folded/not labeled by otool at this address (a 0-line
   * disasm — raise a decode-later stub rather than invent field initializers).
   * Callers of the ctor set +0x80 (output surface) and +0x88 (HGNode*), which
   * are the only fields ReadTile is observed to touch.
   */
  constructor(
    _node: HGNode,
    _rect: HGRect,
    _format: HGFormat,
    _exec: HGExecutionUnit,
  ) {
    // Un-decoded body at @0x00153f50 (ICF-folded / no otool label).
    // Field initialization must be recovered from a labeled disasm or from
    // HGBuffer::HGBuffer (parent ctor) before this is safe to instantiate.
    throw new Error('HGNodeBuffer ctor @0x00153f50 not yet transcribed (ICF-folded / no body label)');
  }

  /**
   * HGNodeBuffer::ReadTile(void* dst, HGRect r, int flags) @0x00153fa0
   *
   * Asm (verbatim, x86_64):
   *   0x153fb0  movq 0x80(%rdi), %r8      ; r8 = this->surface_0x80
   *   0x153fb7  movq 0x88(%rdi), %rdi     ; rdi = this->node_0x88   (an HGNode*)
   *   0x153fbe  movl 0x24(%rdi), %r14d    ; save node[+0x24] (int)  → r14d
   *   0x153fc2  movl 0x70(%rdi), %r15d    ; save node[+0x70] (int)  → r15d
   *   0x153fc6  callq HGExecutionUnit::RenderTile(float v4*, HGRect, HGNode*, int)
   *              args (SysV):  rdi=exec-unit? actually rdi=node here → RenderTile takes
   *              (this=exec-unit implicit? see note), first-arg `float v4* = r8=surface`,
   *              rect, node, flags=r9d=r8d(=input `flags` arg).
   *   0x153fcb  movq 0x88(%rbx), %rax     ; rax = this->node_0x88 (reloaded — RenderTile may have
   *                                       ;   swapped/overwritten the +0x24/+0x70 fields; we
   *                                       ;   restore them to the pre-call values.)
   *   0x153fd2  movl %r14d, 0x24(%rax)
   *   0x153fd6  movl %r15d, 0x70(%rax)
   *   0x153fe4  retq
   *
   * The observable behaviour is: snapshot the two int scratch fields on the
   * node, invoke the exec-unit to render into `this->surface_0x80`, restore
   * the scratch fields. It's a save/restore around the render call.
   */
  ReadTile(_dst: unknown, _rect: HGRect, _flags: number): void {
    // @0x153fb0 : surface = this.surface_0x80
    const surface = this.surface_0x80;
    // @0x153fb7 : node = this.node_0x88
    const node = this.node_0x88 as (Record<string, number> | null);
    if (node == null) {
      // Deref of null +0x88 would segfault in native; raise instead.
      throw new Error('HGNodeBuffer.ReadTile: node_0x88 is null @0x153fb7');
    }
    // @0x153fbe / @0x153fc2 : snapshot node[+0x24] and node[+0x70] (both 32-bit ints).
    // Represented as opaque numeric slots keyed by offset until HGNode is ported.
    const savedAt24 = (node as Record<string, number>)['off_0x24'];
    const savedAt70 = (node as Record<string, number>)['off_0x70'];

    // @0x153fc6 : HGExecutionUnit::RenderTile(surface, rect, node, flags)
    HGNodeBuffer.HGExecutionUnit_RenderTile(surface, _rect, node, _flags);

    // @0x153fcb–@0x153fd6 : restore node[+0x24] and node[+0x70] to the pre-call values.
    (node as Record<string, number>)['off_0x24'] = savedAt24;
    (node as Record<string, number>)['off_0x70'] = savedAt70;
  }

  /**
   * Frontier callee — HGExecutionUnit::RenderTile(float v4*, HGRect, HGNode*, int)
   * called @0x153fc6 (mangled __ZN15HGExecutionUnit10RenderTileEPDv4_f6HGRectP6HGNodei).
   * Not yet transcribed — raises until HGExecutionUnit lands.
   */
  private static HGExecutionUnit_RenderTile(
    _surface: unknown,
    _rect: HGRect,
    _node: unknown,
    _flags: number,
  ): void {
    throw new Error('HGExecutionUnit::RenderTile @callq 0x00153fc6 not yet transcribed');
  }

  /**
   * HGNodeBuffer::WriteTile(void const*, HGRect) @0x001573c0
   *
   * Asm (verbatim):
   *   0x1573c0  pushq %rbp
   *   0x1573c1  movq  %rsp, %rbp
   *   0x1573c4  popq  %rbp
   *   0x1573c5  retq
   *
   * The body is a plain no-op. HGNodeBuffer models a *read-only* surface fed
   * by an HGExecutionUnit; writes are silently ignored. (Contrast HGBuffer::
   * WriteTile which does real memcpy work — this override intentionally
   * shadows it to disable writes on node-backed buffers.)
   */
  WriteTile(_src: unknown, _rect: HGRect): void {
    // no-op by design @0x001573c0
  }

  /**
   * HGNodeBuffer::~HGNodeBuffer() [D1 — complete-object dtor] @0x00157390
   *
   * Asm:
   *   0x157390 pushq %rbp
   *   0x157391 movq  %rsp, %rbp
   *   0x157394 popq  %rbp
   *   0x157395 jmp   HGBuffer::~HGBuffer()   ## tail-call to parent D2
   *
   * Trivial tail-call to the base HGBuffer destructor. TS has no destructors
   * so this is a marker only; if we ever add resource cleanup we mirror
   * HGBuffer::~HGBuffer here.
   */
  dispose(): void {
    // @0x157395 : jmp __ZN8HGBufferD2Ev — delegate to HGBuffer::~HGBuffer (not yet ported).
    HGNodeBuffer.HGBuffer_dtor(this);
  }

  /**
   * HGNodeBuffer::~HGNodeBuffer() [D0 — deleting dtor] @0x001573a0
   *
   * Asm:
   *   0x1573a6 movq  %rdi, %rbx
   *   0x1573a9 callq HGBuffer::~HGBuffer()
   *   0x1573ae movq  %rbx, %rdi
   *   0x1573b7 jmp   HGObject::operator delete(void*)
   *
   * Runs the base destructor and hands the raw storage to HGObject::operator
   * delete. In TS there is no analogue to `operator delete`; we mirror the
   * two side-effects (parent-dtor + release) via disposeAndFree().
   */
  disposeAndFree(): void {
    // @0x1573a9 : callq HGBuffer::~HGBuffer()
    HGNodeBuffer.HGBuffer_dtor(this);
    // @0x1573b7 : jmp HGObject::operator delete(void*)
    HGNodeBuffer.HGObject_operator_delete(this);
  }

  /**
   * Frontier callee — HGBuffer::~HGBuffer (__ZN8HGBufferD2Ev). Not yet ported;
   * raises so the demand for HGBuffer is visible.
   */
  private static HGBuffer_dtor(_self: HGNodeBuffer): void {
    throw new Error('HGBuffer::~HGBuffer @jmp 0x00157395 / @callq 0x001573a9 not yet transcribed');
  }

  /**
   * Frontier callee — HGObject::operator delete (__ZN8HGObjectdlEPv).
   * Not yet ported; raises so the demand for HGObject is visible.
   */
  private static HGObject_operator_delete(_self: HGNodeBuffer): void {
    throw new Error('HGObject::operator delete @jmp 0x001573b7 not yet transcribed');
  }
}
