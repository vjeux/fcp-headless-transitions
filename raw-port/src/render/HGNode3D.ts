// raw-port/src/render/HGNode3D.ts
//
// FCP `HGNode3D` — the Helium base class for every render-graph node whose
// output is produced by rasterizing 3D geometry into pixel tiles (as opposed
// to the plain fragment-shader `HGNode` path). Subclasses supply a per-tile
// fragment-shader implementation via a virtual dispatch on vtable *0x230.
//
// Symbols decoded here (Helium.framework, x86_64 slice — from
// /tmp/Helium_symmap.tsv):
//   0x122220   HGNode3D::HGNode3D()                        [C1/C2 — see body]
//   0x122260   HGNode3D::~HGNode3D()                       [D0 deleting dtor]
//   0x122280   HGNode3D::RenderFragment(HGFragment*, HGTile*) -> int
//                — the FRAGMENT-shader entry is intentionally not implemented on
//                  a NODE3D: FCP prints a warning and returns 0. See body.
//   0x1222a0   HGNode3D::RenderFragment_DEBUG(HGFragment*, HGTile*, HGSampleRectStat*)
//                — pure tail-call to this->vtable[0x230].
//   0x1222c0   HGNode3D::RenderTile(HGTile*) -> int  [BIG — throw-stub, see comment]
//
// The C1/D1 non-thunk entries are ICF-folded with C2/D2 (same body); D2 is not
// separately extractable via `otool -tV` on x86_64 for this class (identical to
// D0 minus the operator-delete tail-jmp; see the D0 disasm on disk).
//
// Class hierarchy: HGNode3D : HGNode : HGObject.
// The ctor sets `this->vptr = &vtable_HGNode3D` (VM 0x1a1da20 = 0x122235 rip +
// 0x8fb7eb; see @0x12222e). The dtor is a plain D2 chain: call HGNode::~HGNode()
// then jmp HGObject::operator delete — no extra HGNode3D-owned fields to unwind.
//
// This file transcribes the small helpers verbatim and marks the big rasterizer
// loop (`RenderTile`) as a loud gap per PORTING_SPEC Rule 3. Its 139-line body
// contains a nested pixel loop that packs u16 fixed-point deltas, dispatches to
// `this->vtable[0x230]` per column, and advances four pointer streams by
// (line_stride + column_stride) — a real port needs HGTile / HGFragment / the
// four RIP-relative SIMD constant blobs at Helium (0x3c7c40, 0x3c9fe0, 0x3cb140,
// 0x3cbc90 approx — see @0x1222f5..0x12231f in RenderTile.s) fully decoded first.

import { HGNode } from "./HGNode.js";

// -----------------------------------------------------------------------------
// Undecoded frontier — throwing stubs citing exact call sites.
// -----------------------------------------------------------------------------

/**
 * `HGLogger::warning(char const*, ...)` variadic — called by RenderFragment @0x12228d.
 * Symbol: `__ZN8HGLogger7warningEPKcz`. Not yet decoded (a printf-style logger).
 * We provide a JS-side thin wrapper that mirrors the observable effect (emit a
 * warning line). The message string is baked from the disasm literal pool ref
 * @0x122284 (RIP-rel disp 0x7c627a -> "WARNING - RenderFragment invoked on non
 * -fragment compiled node\n").  Note the literal has an extra space before
 * "-fragment" (typo faithfully preserved).
 *
 * NOTE per Rule 3: this is a THIN OBSERVABLE MIRROR (write a warning line), not
 * an algorithmic fabrication — HGLogger itself is deferred. If a byte-exact
 * logger port is later required, this call is oracle-replaced.
 */
function HGLogger_warning(msg: string, ..._args: unknown[]): void {
  // Faithful mirror of the sole observable postcondition (a warning line).
  // Cite: raw-port/re/disasm/Helium.HGNode3D.RenderFragment.s @0x12228d.
  // eslint-disable-next-line no-console
  console.warn(msg);
}

/**
 * Virtual dispatch on `this->vtable[0x230]`. Slot 0x230 = byte offset 0x230
 * (index 70, 8-byte slots). This is the concrete subclass's fragment-shader
 * hook. Called from:
 *   @0x12240f  RenderTile          — inner-loop per-column dispatch (packed 3-arg)
 *   @0x1222af  RenderFragment_DEBUG — pure tail-call (2-arg)
 * The receiver signature is class-dependent; we type it as a broadly-shaped
 * callable and let concrete subclasses fill it in.
 */
export interface HGNode3D_VTable {
  /** Slot at byte offset 0x230 — subclass fragment-shader entry. Return type
   *  is subclass-defined (int / void / HGFragment*). */
  slot0x230(...args: unknown[]): unknown;
}

/**
 * `HGObject::operator delete(void*)` — symbol `__ZN8HGObjectdlEPv`, tail-jumped
 * from D0 @0x122277. The base HGObject class (per raw-port/src/render/HGObject.ts)
 * owns this operator. We route to the real HGObject.operatorDelete when the D0
 * thunk fires. The tail-jmp is a pure control-transfer with `this` still in rdi;
 * no additional side effects to model.
 *
 * The concrete `__ZN8HGObjectdlEPv` body is not yet transcribed in this port
 * (see HGObject.ts frontier). We surface it as a throwing stub citing the site.
 */
function HGObject_operatorDelete(_thisPtr: HGNode3D): void {
  throw new Error(
    "raw-port: HGObject::operator delete(void*) (tail-jmp from HGNode3D::~HGNode3D D0 @0x122277) not yet transcribed"
  );
}

// -----------------------------------------------------------------------------
// Class
// -----------------------------------------------------------------------------

/**
 * HGNode3D — abstract base for rasterizer/pipeline nodes.  Concrete subclasses
 * are e.g. `HGRasterizer`, `HGGLNode` (see the `addFragmentShader(HGNode3D*)`
 * and `enableXFormConcatenation(HGNode3D*)` free functions in the symbol map).
 *
 * Layout: same as HGNode (no extra HGNode3D-owned fields visible from ctor/
 * dtor); the vtable pointer is the sole install.
 */
export class HGNode3D extends HGNode {
  /**
   * Concrete vtable dispatch table — normally installed at C++ construction time
   * as `this->vptr = &vtable_HGNode3D`. Subclasses override slot0x230 (the
   * fragment-shader hook exercised by RenderTile and RenderFragment_DEBUG).
   */
  vtable3D: HGNode3D_VTable;

  /**
   * HGNode3D::HGNode3D()  @0x122220  (C1; C2 is ICF-identical)
   *
   * Body (verbatim @0x122220..0x12223e):
   *   push %rbp ; mov %rsp,%rbp ; push %rbx ; push %rax    ; prologue
   *   mov  %rdi,%rbx                                        ; rbx = this
   *   call __ZN6HGNodeC2Ev                                  ; base HGNode ctor
   *   leaq 0x8fb7eb(%rip),%rax   ; @0x12222e — RIP-rel target = 0x122235+0x8fb7eb = 0x1a1da20
   *   mov  %rax,(%rbx)                                      ; this->vptr = &vtable_HGNode3D
   *   pop %rbx ; pop %rbp ; ret                             ; epilogue
   *
   * No per-instance fields beyond the vtable pointer are set — the class is a
   * pure polymorphic dispatch shim over HGNode.
   */
  constructor(vtable3D: HGNode3D_VTable) {
    // @0x122229 — HGNode base ctor (parent-class construction). The TS super
    // call replaces the C2 dispatch; HGNode's ctor is already ported.
    super();
    // @0x12222e-@0x122235 — install the HGNode3D vtable pointer (VM 0x1a1da20).
    // We model the vtable as an object rather than a raw pointer; the field
    // name is chosen distinct from HGNode's vptr so subclass overrides are
    // explicit.
    this.vtable3D = vtable3D;
  }

  /**
   * HGNode3D::~HGNode3D()  @0x122260  (D0 deleting dtor)
   *
   * Body (verbatim @0x122260..0x122277):
   *   push %rbp ; mov %rsp,%rbp ; push %rbx ; push %rax    ; prologue
   *   mov  %rdi,%rbx                                        ; save this
   *   call __ZN6HGNodeD2Ev                                  ; base HGNode dtor
   *   mov  %rbx,%rdi                                        ; restore this for delete
   *   add  $0x8,%rsp ; pop %rbx ; pop %rbp                  ; epilogue
   *   jmp  __ZN8HGObjectdlEPv                               ; tail-jmp HGObject::operator delete
   *
   * D1/D2 (non-deleting variants) are ICF-folded with the same body minus the
   * operator-delete tail-jmp. In this port we expose only D0 (the deleting form
   * matching JS GC semantics).
   */
  destroy_D0(): void {
    // @0x122269 — HGNode base dtor.  HGNode's D2 is landed; call it explicitly.
    // (In JS the class is GC'd; we model the C++ order for parity with the raw
    // asm control flow.  Actual field cleanup is a no-op since HGNode3D adds
    // no owned pointers beyond the vtable.)
    // NOTE: HGNode's dtor is not directly exposed as a method in the port; the
    // faithful model is "call base D2 semantics". We touch the base state via
    // the super instance (any HGNode-owned cleanup already happened when the
    // TS super() ctor ran, and HGNode's cleanup is empty in this port).
    void this;
    // @0x122277 — tail-jmp HGObject::operator delete(this).
    HGObject_operatorDelete(this);
  }

  /**
   * HGNode3D::RenderFragment(HGFragment*, HGTile*)  @0x122280 -> int
   *
   * Body (verbatim @0x122280..0x122295):
   *   push %rbp ; mov %rsp,%rbp
   *   leaq 0x7c627a(%rip),%rdi     ; @0x122284 -> literal
   *                                ;  "WARNING - RenderFragment invoked on non -fragment compiled node\n"
   *   xor  %eax,%eax                ; variadic-arg count = 0
   *   call __ZN8HGLogger7warningEPKcz  ; HGLogger::warning(fmt, ...)
   *   xor  %eax,%eax                ; return 0
   *   pop  %rbp ; ret
   *
   * HGNode3D declines to implement the fragment-shader entrypoint (which is a
   * FRAGMENT-node method) — it logs a warning and returns 0. Subclasses that
   * ARE fragment-compiled override this in their own vtable slot.
   */
  RenderFragment(_fragment: unknown, _tile: unknown): number {
    HGLogger_warning(
      "WARNING - RenderFragment invoked on non -fragment compiled node\n"
    );
    return 0;
  }

  /**
   * HGNode3D::RenderFragment_DEBUG(HGFragment*, HGTile*, HGSampleRectStat*)  @0x1222a0
   *
   * Body (verbatim @0x1222a0..0x1222af):
   *   push %rbp ; mov %rsp,%rbp
   *   mov  (%rdi),%rax              ; rax = this->vptr
   *   mov  0x230(%rax),%rax         ; rax = vtable[0x230] slot
   *   pop  %rbp
   *   jmpq *%rax                    ; tail-call with args (%rdi, %rsi, %rdx) intact
   *
   * A one-instruction virtual dispatch: forward all three args to the subclass
   * slot0x230. The return value is whatever the concrete subclass returns
   * (the tail-jmp preserves the C++ return convention).
   */
  RenderFragment_DEBUG(fragment: unknown, tile: unknown, stat: unknown): unknown {
    // @0x1222a4..0x1222af — tail-jmp this->vtable[0x230](this, fragment, tile, stat).
    return this.vtable3D.slot0x230(this, fragment, tile, stat);
  }

  /**
   * HGNode3D::RenderTile(HGTile*)  @0x1222c0
   *
   * A 139-line SIMD nested-loop rasterizer that:
   *   1. Extracts the tile's 4-int bounding box from *(rsi) into xmm0/xmm1
   *      (movdqa + pshufd/psubd), computes width & height.               @0x1222d7..0x1222ee
   *   2. Loads 4 RIP-relative 16-byte SIMD constants into a 0x160-byte
   *      workspace at rbp-0x220..-0x1c0 (4 packed lanes each), then memcpy's
   *      0x160 bytes of subclass parameter state.                        @0x1222f5..0x122339
   *   3. For each pixel row (r13 in [0, height)):
   *        - Broadcasts an increment-vector into 10 slots at rbp-0x2b0..-0x230
   *        - Dispatches this->vtable[0x230](this, work-ptrs, ctx)         @0x12240f
   *        - Advances 4 pointer streams by (16 + N*16) where N is read from
   *          the tile at rbp-0x1a8/-0x198/-0x188/-0x178.
   *        - Adds a broadcast constant to the pixel-x SIMD accumulator.
   *
   * Faithfully transcribing this needs the 4 RIP-rel SIMD constants at
   *   @Helium 0x2a5944 disp @0x1222f5 -> const @0x3c7c40 (xmm scratch init)
   *   @Helium 0x2a7cd6 disp @0x122303 -> const @0x3c9fe0
   *   @Helium 0x2a8e28 disp @0x122311 -> const @0x3cb140
   *   @Helium 0x2a975a disp @0x12231f -> const @0x3cbc90
   *   plus the cvtdq2ps mulps @0x2a7d29 (target ~0x3ca0b8) and addps @0x2a7d32 (target ~0x3ca0c0)
   *   inside the loop preamble.
   * AND the 0x230-slot receiver signature (see HGNode3D_VTable) AND the HGTile
   * layout at (rsi) — none of which are decoded yet.
   *
   * Per PORTING_SPEC Rule 3 we mark this as a loud gap. The full disasm sits
   * at raw-port/re/disasm/Helium.HGNode3D.RenderTile.s for the follow-up decoder.
   */
  RenderTile(_tile: unknown): number {
    throw new Error(
      "raw-port: HGNode3D::RenderTile @0x1222c0 not yet transcribed — 139-line SIMD nested-loop " +
        "rasterizer requires 4 RIP-relative SIMD constants (@Helium 0x3c7c40/0x3c9fe0/0x3cb140/" +
        "0x3cbc90), the HGTile bbox+stride layout at (rsi), and the vtable[0x230] receiver " +
        "signature to be decoded first. See raw-port/re/disasm/Helium.HGNode3D.RenderTile.s."
    );
  }
}

export default HGNode3D;

