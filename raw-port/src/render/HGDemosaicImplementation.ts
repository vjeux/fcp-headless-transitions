// HGDemosaicImplementation — Helium raw-image demosaic implementation node. Framework: Helium.
//
// Symbols on Helium (x86_64 thin slice VA==offset):
//   __ZN24HGDemosaicImplementation12SetParameterEiffff  @0xdd420  SetParameter(int,float,float,float,float)
//   __ZN24HGDemosaicImplementation13GenerateGraphEP10HGRendererP6HGNode
//                                                        @0xdd560  GenerateGraph(HGRenderer*, HGNode*)
//   __ZN24HGDemosaicImplementationD0Ev                   @0xddc60  deleting dtor
//   __ZN24HGDemosaicImplementationD1Ev                   @0xddc20  base dtor
//
// FAITHFUL PORT — every function cites @Helium 0xADDR. Undecoded frontier callees throw.
// Single-precision stores wrapped in Math.fround (Rule 4). NaN-ordered ucomiss/jne/jnp idiom
// preserved with `!==` (not Object.is).

// ── STRUCT LAYOUT ──────────────────────────────────────────────────────────────────────────────
//   Inherits from HGObject (D0 tail-jumps to HGObject::operator delete @0xddc93 and D1/D0 body
//   calls HGObject::~HGObject @0xddc85). Not an HGNode (no HGNode::HGNode ctor observed here).
//   Fields observed via SetParameter jump-table writes and D0:
//     +0x00   vptr slot          (installed by D0 to HGDemosaicImplementation vtable
//                                 via `leaq 0x92f928(%rip),%rax; movq %rax,(%rdi)` @0xddc69
//                                 -> RIP-end=0xddc70, disp=0x92f928 -> target=0xa0d598)
//     +0x0c   f32   p0           SetParameter idx=0 writes here @0xdd44b
//     +0x10   f32   p1           SetParameter idx=1 writes here @0xdd4cb
//     +0x14   f32   p2           SetParameter idx=2 writes here @0xdd47b
//     +0x18   f32   p3.x         SetParameter idx=3 writes here (vec2 low)  @0xdd4a4
//     +0x1c   f32   p3.y         SetParameter idx=3 writes here (vec2 high) @0xdd4a4
//     +0x20   f32   p4           SetParameter idx=4 writes here @0xdd463
//     +0x24   f32   p5           SetParameter idx=5 writes here @0xdd4df
//     +0x28   f32   p6           SetParameter idx=6 writes here @0xdd4f3
//     +0x2c   f32   p7           SetParameter idx=7 writes here @0xdd4b7
//     +0x30   f32   p8.x         SetParameter idx=8 writes here (vec2 low)  @0xdd527
//     +0x34   f32   p8.y         SetParameter idx=8 writes here (vec2 high) @0xdd527
//     +0x38   HGNode*  childNode  released in D0 via vt[0x18] @0xddc7f (conditional on non-null)
//
// The +0x38 field is written by GenerateGraph (undecoded here) — it's the last-built subgraph
// output that this class caches for the demosaic pipeline.

// ── opaque frontier types ──────────────────────────────────────────────────────────────────────
export interface HGNode {
  /** vt[0x18] = HGObject::Release — called by D0 @0xddc7f on the +0x38 child if non-null. */
  Release(): void;
}
/** HGRenderer — Helium frame renderer. Consumed by GenerateGraph. */
export interface HGRenderer {}

// ── the class ──────────────────────────────────────────────────────────────────────────────────
export class HGDemosaicImplementation {
  /** +0x0c */ private p0: number = 0;
  /** +0x10 */ private p1: number = 0;
  /** +0x14 */ private p2: number = 0;
  /** +0x18 */ private p3x: number = 0;
  /** +0x1c */ private p3y: number = 0;
  /** +0x20 */ private p4: number = 0;
  /** +0x24 */ private p5: number = 0;
  /** +0x28 */ private p6: number = 0;
  /** +0x2c */ private p7: number = 0;
  /** +0x30 */ private p8x: number = 0;
  /** +0x34 */ private p8y: number = 0;
  /** +0x38 */ private childNode: HGNode | null = null;

  /**
   * HGDemosaicImplementation::~HGDemosaicImplementation() @Helium 0xddc60 (D0), 0xddc20 (D1).
   * D0 body: install base vptr, if childNode != null call childNode->vt[0x18](Release),
   * then HGObject::~HGObject @0xddc85 (base subobj dtor), then HGObject::operator delete
   * @0xddc93 (tail-jumped). D1 is the analogous "no delete" variant.
   */
  destroy(): void {
    // @0xddc73..0xddc7f
    if (this.childNode !== null) {
      this.childNode.Release();  // vt[0x18] @0xddc7f
      this.childNode = null;
    }
    // HGObject::~HGObject @0xddc85 and delete @0xddc93 — deferred to GC.
  }

  /**
   * HGDemosaicImplementation::SetParameter(int idx, float a, float b, float _c, float _d)
   * @Helium 0xdd420.
   *
   * Signature: `idx` (esi), `a` (xmm0), `b` (xmm1) — the vec2 slots (idx=3, idx=8) use both a
   * and b; the scalar slots use only a. c/d are ignored.
   *
   * Jump-table @0xdd534 (leaq 0xfe(%rip),%rcx @0xdd42f -> RIP-end=0xdd436, base=0xdd436+0xfe=0xdd534),
   * 9 entries (idx=0..8). idx>=9 -> return -1 @0xdd51a.
   *
   *   idx=0 -> 0xdd43f  scalar to +0x0c
   *   idx=1 -> 0xdd4c3  scalar to +0x10
   *   idx=2 -> 0xdd46f  scalar to +0x14
   *   idx=3 -> 0xdd487  vec2   to +0x18/+0x1c (movsd loads current, ucomiss compares each lane,
   *                             insertps merges b into hi lane, movlps stores 8 bytes)
   *   idx=4 -> 0xdd457  scalar to +0x20
   *   idx=5 -> 0xdd4d7  scalar to +0x24
   *   idx=6 -> 0xdd4eb  scalar to +0x28
   *   idx=7 -> 0xdd4af  scalar to +0x2c
   *   idx=8 -> 0xdd4ff  vec2   to +0x30/+0x34 (same shape as idx=3)
   *
   * Common return path @0xdd516: xorl %eax,%eax; ret  (return 0 = no-op / identical value).
   * Each write-branch has its own ret: `movl $1, %eax; ret` (return 1 = changed).
   *
   * NaN-ordered dedup preserved: `ucomiss cur, val; jne .W; jnp .R0` means "if ordered-and-equal,
   * skip the write; else (including NaN-vs-anything) do the write". Preserved with `!==`.
   */
  SetParameter(idx: number, a: number, b: number, _c: number, _d: number): number {
    // @0xdd424..0xdd427: cmpl $0x8, %esi; ja 0xdd51a -> return -1
    if ((idx >>> 0) > 8) {
      return -1;  // @0xdd51a: movl $0xffffffff, %eax; retq
    }
    const aF = Math.fround(a);
    const bF = Math.fround(b);
    let cur: number, curX: number, curY: number;
    switch (idx) {
      case 0: // @0xdd43f writes +0x0c
        cur = this.p0;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p0 = aF; return 1; }
        return 0;
      case 1: // @0xdd4c3 writes +0x10
        cur = this.p1;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p1 = aF; return 1; }
        return 0;
      case 2: // @0xdd46f writes +0x14
        cur = this.p2;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p2 = aF; return 1; }
        return 0;
      case 3: { // @0xdd487 writes +0x18/+0x1c (vec2)
        // movsd 0x18(%rdi),%xmm2  -> load 8 bytes (2 floats: cur[x]=p3x, cur[y]=p3y).
        // ucomiss %xmm2, %xmm0    -> compare cur.x vs a
        // jne 0xdd49e; jp 0xdd49e -> if unordered-or-notequal, write; else check .y
        //   movshdup %xmm2, %xmm2 -> broadcast hi float32 lane into low; effectively cur.y
        //   ucomiss %xmm2, %xmm1  -> compare cur.y vs b
        //   jne 0xdd49e; jnp 0xdd516 -> if ordered-and-equal .y too, skip (return 0)
        // .W (0xdd49e): insertps 0x10 -> xmm0 = (a, b, xmm0[2], xmm0[3]); movlps to +0x18
        curX = this.p3x; curY = this.p3y;
        const xEq = curX === aF && curX === curX && aF === aF;
        const yEq = curY === bF && curY === curY && bF === bF;
        if (xEq && yEq) return 0;         // @0xdd516: xorl %eax,%eax; ret
        this.p3x = aF; this.p3y = bF;     // @0xdd4a4: movlps %xmm0, +0x18
        return 1;                          // @0xdd4a8: movl $1, %eax; ret
      }
      case 4: // @0xdd457 writes +0x20
        cur = this.p4;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p4 = aF; return 1; }
        return 0;
      case 5: // @0xdd4d7 writes +0x24
        cur = this.p5;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p5 = aF; return 1; }
        return 0;
      case 6: // @0xdd4eb writes +0x28
        cur = this.p6;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p6 = aF; return 1; }
        return 0;
      case 7: // @0xdd4af writes +0x2c
        cur = this.p7;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p7 = aF; return 1; }
        return 0;
      case 8: { // @0xdd4ff writes +0x30/+0x34 (vec2, same shape as idx=3)
        curX = this.p8x; curY = this.p8y;
        const xEq = curX === aF && curX === curX && aF === aF;
        const yEq = curY === bF && curY === curY && bF === bF;
        if (xEq && yEq) return 0;         // @0xdd516: xorl %eax,%eax; ret  (via 0xdd521 fallthrough to 0xdd516? actually the code paths differ — idx=8's not-equal branch goes to 0xdd521; equal-and-equal drops to 0xdd516 via jp @0xdd514.)
        this.p8x = aF; this.p8y = bF;     // @0xdd527: movlps %xmm0, +0x30
        return 1;                          // @0xdd52b: movl $1, %eax; ret
      }
      default:
        return -1;
    }
  }

  /**
   * HGDemosaicImplementation::GenerateGraph(HGRenderer* r, HGNode* input) @Helium 0xdd560.
   * 160-line real render-graph builder — uses the 11 parameter slots to construct a
   * bayer-demosaic subgraph. Undecoded here; full port requires the HGRenderer / HGNode
   * factories and the specific HgcDemosaic* leaf shaders. Frontier — port those first.
   */
  GenerateGraph(_r: HGRenderer, _input: HGNode | null): HGNode {
    throw new Error(
      'HGDemosaicImplementation::GenerateGraph @Helium 0xdd560 not yet transcribed ' +
      '(160-line render-graph builder with 11 params + HgcDemosaic* leaf shaders)',
    );
  }
}
