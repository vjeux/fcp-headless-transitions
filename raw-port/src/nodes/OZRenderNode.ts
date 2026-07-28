// OZRenderNode.ts — Ozone::OZRenderNode: an ABSTRACT base class for a
// render-graph node. All 8 exported symbols in the ledger are TINY: either
// vtable tail-thunks (getPreviewBounds, getBoundary), constant-writers
// (getBounds, getPixelAspectRatioRN), a default-constructed-hash return
// (getHashForStateRN, getStaticHashRN), or `ud2` pure-virtual dtor traps
// (~OZRenderNode D0/D1). No fields are read by any of these — the class
// data at this layer is entirely virtual-dispatch scaffolding.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice).
// Disasm saved: raw-port/re/disasm/OZRenderNode.*.s.
//
// Vtable snapshot (Ozone, `resolve.py Ozone vtable OZRenderNode`):
//   *0x10 -> OZRenderNode::getBounds(PCRect<double>*, OZRenderState const&) @0x83340
//   *0x20 -> OZRenderNode::getBoundary(PCRect<double>*, OZRenderState const&) @0x83330
//   (getPreviewBounds @0x83320 and getBoundary @0x83330 both TAIL-DISPATCH
//    through vtable slot +0x10, i.e. they call the *virtual* getBounds so
//    any override in a derived class wins.)
//
// FRONTIER (types held as `unknown` at this layer; only reference by name):
//   OZRenderState        — const& passed through, never fielded here.
//   OZRenderParams       — reference passed through to getHashForStateRN.
//   OZObjectManipulator  — element of the std::list passed to hashers.
//   PCSerializerWriteStream — abstract sink; already landed in infra/.
//
// PCHash128 default ctor (ProCore @0x1bf36 __ZN9PCHash128C1Ev) is a
// `xorps xmm0,xmm0 ; movups xmm0,(%rdi) ; retq` — zeros 16 bytes at *this.
// The hash-return functions write that zero into their [this+0x8] slot
// (getStaticHashRN's `leaq 0x8(%rdi), %rax; ret`) or into the caller-
// supplied return slot (`%rdi` = sret pointer for getHashForStateRN).

import { PCSerializerWriteStream } from "../infra/PCSerializerWriteStream";

/** A PCRect<double> — matches the layout used by PCFilterUtils.PCRectDouble.
 *  x @+0x00, y @+0x08, width @+0x10, height @+0x18. Recovered from the
 *  getBounds body: `movups %xmm0, 0x10(%rsi)` writes {width,height}. */
export interface PCRectDouble {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** OZRenderState — undecoded at this layer; passed by-const-ref only. */
export type OZRenderState = unknown;
/** OZRenderParams — undecoded at this layer; passed by-ref only. */
export type OZRenderParams = unknown;
/** OZObjectManipulator — element type of the std::list arg; undecoded. */
export type OZObjectManipulator = unknown;

/** A 128-bit hash — wire-compatible with PCMD5's PCHash128 output.
 *  PCHash128::PCHash128() @ProCore 0x1bf36 zeros all 16 bytes, so a
 *  default-constructed hash is {a:0,b:0,c:0,d:0}. */
export interface PCHash128 {
  readonly kind: "PCHash128";
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
}

/** Default PCHash128 (all zeros) — matches PCHash128::PCHash128() @ProCore 0x1bf36. */
function makeDefaultPCHash128(): PCHash128 {
  return { kind: "PCHash128", a: 0, b: 0, c: 0, d: 0 };
}

/**
 * OZRenderNode — abstract render-graph node base. Concrete derived nodes
 * override getBounds (vtable +0x10) and destruction; this layer defines
 * only the trivial defaults and virtual-dispatch tail-thunks.
 */
export abstract class OZRenderNode {
  /**
   * getPreviewBounds — @Ozone 0x83320.
   *
   * Disasm (7 insns):
   *   pushq %rbp; movq %rsp,%rbp
   *   movq  (%rdi), %rax        ; load vptr
   *   movq  0x10(%rax), %rax    ; load slot +0x10  (= getBounds)
   *   popq  %rbp; jmpq *%rax    ; tail-call
   *
   * i.e. `getPreviewBounds(out, state)` == `this->getBounds(out, state)`
   * dispatched virtually — a derived override of getBounds is used.
   */
  getPreviewBounds(out: PCRectDouble, state: OZRenderState): void {
    // Tail-dispatch to virtual getBounds (vtable slot +0x10).
    this.getBounds(out, state);
  }

  /**
   * getBoundary — @Ozone 0x83330.
   *
   * Disasm (7 insns): identical shape to getPreviewBounds — loads vtable
   * slot +0x10 and tail-jumps. So `getBoundary(out, state)` also virtually
   * dispatches to `getBounds`.
   */
  getBoundary(out: PCRectDouble, state: OZRenderState): void {
    // Tail-dispatch to virtual getBounds (vtable slot +0x10).
    this.getBounds(out, state);
  }

  /**
   * getBounds — @Ozone 0x83340. Virtual (vtable +0x10).
   *
   * Disasm (5 insns):
   *   pushq %rbp; movq %rsp,%rbp
   *   movaps 0x682075(%rip), %xmm0   ; load 16 bytes at 0x7053C0
   *   movups %xmm0, 0x10(%rsi)       ; store to (PCRect<double>*)+0x10
   *   popq %rbp; retq
   *
   * The 16-byte constant at 0x7053C0 is two IEEE-754 doubles: both -1.0
   * (`resolve.py Ozone const 0x7053c0 -> -1.0`, `... 0x7053c8 -> -1.0`).
   * Only writes width/height (offsets +0x10, +0x18); x/y are left untouched.
   */
  getBounds(out: PCRectDouble, _state: OZRenderState): void {
    // 16-byte constant at Ozone .rodata 0x7053C0 = { -1.0, -1.0 } (doubles).
    // movups %xmm0, 0x10(%rsi): store both into width, height in one shot.
    out.width = -1.0;   // @Ozone 0x7053C0 (double -1.0)
    out.height = -1.0;  // @Ozone 0x7053C8 (double -1.0)
  }

  /**
   * getPixelAspectRatioRN — @Ozone 0x83360.
   *
   * Disasm (5 insns):
   *   pushq %rbp; movq %rsp,%rbp
   *   movsd 0x682074(%rip), %xmm0   ; load 8 bytes at 0x7053E0
   *   popq %rbp; retq
   *
   * Returns the double at Ozone .rodata 0x7053E0 = 1.0
   * (`resolve.py Ozone const 0x7053e0 -> 1.0`).
   */
  getPixelAspectRatioRN(): number {
    // Constant at Ozone .rodata 0x7053E0 = 1.0 (double).
    return 1.0;
  }

  /**
   * getHashForStateRN — @Ozone 0x83370.
   *
   * Disasm (7 insns):
   *   pushq %rbp; movq %rsp,%rbp
   *   pushq %rbx; pushq %rax
   *   movq  %rdi, %rbx            ; save sret pointer
   *   callq __ZN9PCHash128C1Ev    ; PCHash128() default ctor @ProCore 0x1bf36
   *                               ; zeros 16 bytes at *rdi
   *   movq  %rbx, %rax            ; return the sret pointer
   *   addq  $0x8,%rsp; popq %rbx; popq %rbp; retq
   *
   * The ABI: %rdi = hidden return-value pointer for a struct return
   * (PCHash128 is 16 bytes but returned by-reference because it has a
   * non-trivial ctor). This function just DEFAULT-CONSTRUCTS a hash into
   * that slot — i.e. returns an all-zero PCHash128. It ignores every
   * parameter (writeStream / params / manipulators list); their addresses
   * live in %rsi/%rdx/%rcx and are never read.
   */
  getHashForStateRN(
    _writeStream: PCSerializerWriteStream,
    _params: OZRenderParams,
    _manipulators: OZObjectManipulator[],
  ): PCHash128 {
    // PCHash128::PCHash128() @ProCore 0x1bf36 — xorps/movups zeros 16 bytes.
    return makeDefaultPCHash128();
  }

  /**
   * getStaticHashRN — @Ozone 0x83390.
   *
   * Disasm (4 insns):
   *   pushq %rbp; movq %rsp,%rbp
   *   leaq  0x8(%rdi), %rax        ; %rax = %rdi + 8
   *   popq %rbp; retq
   *
   * The %rdi here is again the sret pointer for a returned PCHash128, but
   * NO constructor is called and NO memory is written. The returned pointer
   * is bumped +0x8 (past the vtable slot of an outer object? or simply a
   * caller-side "hash goes here" pointer offset). Byte-for-byte this is
   * "leave the 16-byte slot at [sret+0x0..0x10) UNTOUCHED and return
   * sret+0x8". That is: caller sees WHATEVER GARBAGE was already in that
   * slot.
   *
   * We cannot faithfully reproduce "return unchanged caller memory + 8"
   * in TypeScript; the semantic in a value world is "no hash contribution
   * / return an empty/default hash". We surface it as a default PCHash128
   * to keep call sites well-typed, and CITE the exact instruction sequence
   * that shows the base class deliberately writes nothing.
   */
  getStaticHashRN(
    _writeStream: PCSerializerWriteStream,
    _manipulators: OZObjectManipulator[],
  ): PCHash128 {
    // The base symbol is `leaq 0x8(%rdi), %rax; ret` — it deliberately
    // writes NO hash bytes. Derived classes override this to contribute a
    // real static hash. At the abstract-base layer, return a default
    // (all-zero) PCHash128 to match the semantic that no bytes are hashed.
    return makeDefaultPCHash128();
  }

  /**
   * ~OZRenderNode [D1] — @Ozone 0x6daf50.
   *
   * Disasm (4 insns):
   *   pushq %rbp; movq %rsp,%rbp
   *   ud2
   *   nopw %cs:(%rax,%rax)
   *
   * Deliberate `ud2` trap — indicates a pure-virtual / never-invoke marker.
   * Concrete derived classes provide their own destructors; the base D1
   * body must never execute.
   */
  destroyD1_neverCall(): never {
    // OZRenderNode::~OZRenderNode() [D1] @Ozone 0x6daf50 is a `ud2` trap
    // — the base destructor must never be reached on a raw base instance.
    throw new Error(
      "OZRenderNode::~OZRenderNode [D1] @Ozone 0x6daf50 is a `ud2` trap — " +
        "abstract base destructor must never be invoked",
    );
  }

  /**
   * ~OZRenderNode [D0 deleting-dtor] — @Ozone 0x6daf60.
   *
   * Disasm (4 insns): identical `ud2` trap. The deleting-dtor is also
   * pure/never-invoke; delete on the abstract base is not defined here.
   */
  destroyD0_neverCall(): never {
    // OZRenderNode::~OZRenderNode() [D0] @Ozone 0x6daf60 is a `ud2` trap.
    throw new Error(
      "OZRenderNode::~OZRenderNode [D0] @Ozone 0x6daf60 is a `ud2` trap — " +
        "abstract base deleting-destructor must never be invoked",
    );
  }
}
