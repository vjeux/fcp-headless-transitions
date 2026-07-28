// HGAVADeinterlace.ts — Helium render-graph "adaptive video advance
// deinterlace" leaf node. Transcribed verbatim from the FCP Helium
// framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// This class is a concrete HGNode subclass — a deinterlacing node whose
// three parameters (an int mode, a double mystery-coefficient, an int
// enable flag, a bool premultiplied flag) are individually settable via
// the standard HGNode::SetParameter(int idx, float,float,float,float)
// dispatcher.  It exposes a virtual GetOutput(HGRenderer*) which builds
// the underlying render-graph subtree (see the frontier trail near the
// end of this file).
//
// Emitted symbols (Helium, x86_64 slice):
//   HGAVADeinterlace::HGAVADeinterlace()                  [C2 base]     @0x0000000000221280
//   HGAVADeinterlace::HGAVADeinterlace()                  [C1 complete] @0x00000000002212e0
//   HGAVADeinterlace::~HGAVADeinterlace()                 [D2 base]     @0x0000000000221340
//   HGAVADeinterlace::~HGAVADeinterlace()                 [D1 complete] @0x0000000000221380
//   HGAVADeinterlace::~HGAVADeinterlace()                 [D0 deleting] @0x00000000002213c0
//   HGAVADeinterlace::SetParameter(int, float,float,float,float)        @0x0000000000221410
//   HGAVADeinterlace::GetOutput(HGRenderer*)                            @0x0000000000221490
//
// VTABLE: installed by C1 @0x2212f5 (`leaq 0x8100f3(%rip), %rax`) and
// re-installed by every dtor. RIP-relative math:
//   C1 @0x2212f5: (0x2212f5 + 7) + 0x8100f3 = 0x0000000000a313ef
//   Wait — leaq's rip is the next-instruction address. The leaq at
//   0x2212ee is 7 bytes wide (48 8d 05 disp32), so next-inst rip is
//   0x2212f5, and the resolved addr is 0x2212f5 + 0x8100f3 = 0xa313e8.
//   The typeinfo-header slot lives at 0xa313d8 and the vtable data
//   slots start at 0xa313e8 (+0x10 past the header). Every dtor
//   re-installs the same 0xa313e8 value:
//     D2 @0x22134d: 0x221354 + 0x81009b = 0x0000000000a313ef → 0xa313e8 slot
//     D1 @0x22138d: 0x221394 + 0x81005b = 0x0000000000a313ef → 0xa313e8 slot
//     D0 @0x2213d0: 0x2213d7 + 0x810018 = 0x0000000000a313ef → 0xa313e8 slot
//   (All four RIP-relative loads resolve to the same absolute vtable
//    data slot as expected for the Itanium C++ ABI.)
//
// STRUCT LAYOUT — inherits HGNode's entire prefix (HGObject at 0x00,
// HGNode fields through 0x197 — see raw-port/src/render/HGNode.ts) and
// adds these HGAVADeinterlace-specific fields (offsets recovered from
// C1 @0x2212e0 + SetParameter @0x221410):
//   +0x198  int32   mode       — ctor writes 2 (@0x221298 `movl $0x2`)
//                                SetParameter idx=1 writes `(int)floatArg`
//                                (@0x221442 `cvttss2si %xmm0, %rax` +
//                                 @0x22146d `movl %eax, 0x198(%rdi)`)
//   +0x19c  double  coefficient — ctor writes the double at Helium const
//                                 @0x88c890 (bit-pattern 0x3ec8c1553ca0a527
//                                 = 2.9510506225528845e-06). Not writable
//                                 by SetParameter (no case handles this
//                                 slot).
//   +0x1a4  int32   enable     — ctor writes 1 (@0x221312 `movl $0x1`)
//                                SetParameter idx=0 (default case) writes
//                                `(arg != 0.0f) ? 1 : 0` (@0x221427-0x221436).
//   +0x1a8  uint8   premul     — ctor writes 0 (@0x22131c `movb $0x0`)
//                                SetParameter idx=2 writes
//                                `(arg==0.0f && !isNaN(arg)) ? 0 : 1`
//                                via ucomiss+setp/setne+orb
//                                (@0x221453-0x221461).
//   +0x1b0  HGNode* upstream   — ctor writes null (@0x221323 `movq $0x0`).
//                                D0/D1/D2 all release it via vtable slot
//                                +0x18 (HGObject::Release) — see D2
//                                @0x221365 `callq *0x18(%rcx)`.

import { HGNode } from "./HGNode";

/** Opaque handle for HGRenderer. Not decoded here. */
export type HGRendererPtr = {
  readonly __brand: "HGRenderer";
};

/** Opaque handle for the upstream HGNode this deinterlacer owns.
 *  The dtor releases it via vtable slot +0x18 (HGObject::Release), so it
 *  is a retained HGNode pointer. We type it as HGNode | null. */
export type HGNodeUpstreamPtr = HGNode | null;

/**
 * HGAVADeinterlace's initial value for the +0x19c double slot.
 *
 * Loaded by C1/C2 via `movsd 0x66b586(%rip), %xmm0` @0x221302, resolving
 * (next-inst rip 0x22130a + 0x66b586) = 0x0000000000c8c890. resolve.py
 * const 0x88c890 reports u64=0x3ec8c1553ca0a527 → double
 * 2.9510506225528845e-06. Kept as a raw double bit-pattern-preserving
 * constant so any consumer sees exactly the FCP-decoded value.
 *
 * (Bit-pattern-preserving construction via Float64Array to avoid any
 *  literal-decimal-rounding drift.)
 */
export const HGAVADeinterlace_DEFAULT_COEFFICIENT: number = (() => {
  const buf = new ArrayBuffer(8);
  const u32 = new Uint32Array(buf);
  const f64 = new Float64Array(buf);
  // 0x3ec8c1553ca0a527 stored little-endian.
  u32[0] = 0x3ca0a527; // low 32 bits
  u32[1] = 0x3ec8c155; // high 32 bits
  return f64[0];
})();

/**
 * FCP Helium `HGAVADeinterlace`. Concrete HGNode subclass.
 * Vtable installed at absolute address 0xa313e8 by C1/D0/D1/D2 (see
 * file header for RIP-relative arithmetic).
 */
export class HGAVADeinterlace extends HGNode {
  /** +0x198 — parameter index 1 ("mode"), int32. Ctor initial: 2. */
  mode: number = 2;

  /** +0x19c — a fixed double coefficient loaded from Helium const table
   *  @0x88c890 by the ctor. Not writable via SetParameter. */
  coefficient: number = HGAVADeinterlace_DEFAULT_COEFFICIENT;

  /** +0x1a4 — parameter index 0 ("enable"), int32-encoded bool. Ctor
   *  initial: 1. Written by SetParameter idx=0 as `(arg != 0.0f) ? 1 : 0`. */
  enable: number = 1;

  /** +0x1a8 — parameter index 2 ("premul"), uint8-encoded bool. Ctor
   *  initial: 0. Written by SetParameter idx=2 as
   *  `(arg == 0.0f && !isNaN(arg)) ? 0 : 1` (via ucomiss+setp+setne+orb). */
  premul: number = 0;

  /** +0x1b0 — retained upstream HGNode input. Ctor initial: null.
   *  Released by the dtor via vtable slot +0x18. */
  upstream: HGNodeUpstreamPtr = null;

  /**
   * HGAVADeinterlace::HGAVADeinterlace() [C1] @0x00000000002212e0.
   * (The C2 base ctor at @0x0000000000221280 is byte-for-byte identical
   *  in its body — same HGNode::HGNode() call, same vtable install to
   *  0xa313e8, same field initializers. Both entry points share this
   *  TS ctor.)
   *
   * Body:
   *   0x2212e9 callq HGNode::HGNode()               ; base ctor
   *   0x2212ee leaq  0x8100f3(%rip), %rax           ; vtbl = 0xa313e8
   *   0x2212f5 movq  %rax, (%rbx)                   ;  +0x00 vtbl
   *   0x2212f8 movl  $0x2, 0x198(%rbx)              ;  +0x198 mode = 2
   *   0x221302 movsd 0x66b586(%rip), %xmm0          ; coef const @0x88c890
   *   0x22130a movsd %xmm0, 0x19c(%rbx)             ;  +0x19c coefficient
   *   0x221312 movl  $0x1, 0x1a4(%rbx)              ;  +0x1a4 enable = 1
   *   0x22131c movb  $0x0, 0x1a8(%rbx)              ;  +0x1a8 premul = 0
   *   0x221323 movq  $0x0, 0x1b0(%rbx)              ;  +0x1b0 upstream = null
   */
  constructor() {
    super();
    // Fields already initialized to their FCP defaults via the class
    // field initializers above — mirroring the exact ctor stores at
    // 0x2212f8 / 0x22130a / 0x221312 / 0x22131c / 0x221323.
    this.mode = 2;
    this.coefficient = HGAVADeinterlace_DEFAULT_COEFFICIENT;
    this.enable = 1;
    this.premul = 0;
    this.upstream = null;
  }

  /**
   * HGAVADeinterlace::~HGAVADeinterlace() [D2 base] @0x0000000000221340.
   * (D1 complete dtor @0x221380 and D0 deleting dtor @0x2213c0 share the
   *  same core body — see below.)
   *
   * Body @0x221340..0x221371:
   *   0x221346 leaq  0x81009b(%rip), %rax        ; vtbl = 0xa313e8
   *   0x22134d movq  %rax, (%rdi)                ;  reinstall vtbl (ABI)
   *   0x221350 movq  0x1b0(%rdi), %rax           ; upstream
   *   0x221357 testq %rax, %rax                  ; if(upstream != null)
   *   0x22135a je    0x22136b
   *   0x22135c movq  (%rax), %rcx                ;   vtbl of upstream
   *   0x221365 callq *0x18(%rcx)                 ;   HGObject::Release
   *   0x22136b addq  ...
   *   0x221371 jmp   HGNode::~HGNode() [D2]      ; base-class tail-call
   *
   * Note: D2 does NOT null the upstream slot — it only invokes Release.
   * (D1 @0x221395 and D0 @0x2213c9 mirror the exact same pattern; only
   *  D0 additionally tail-calls HGObject::operator delete on `this`.)
   */
  destructD2(): void {
    const upstream = this.upstream;
    if (upstream !== null) {
      // Vtable slot +0x18 on HGObject is Release(). In our pure-JS
      // port there is no reference counting to observe, but the slot
      // itself is not decoded here — this is a frontier callee.
      HGObject_Release(upstream);
    }
    // Base-class tail-call to HGNode::~HGNode() is implicit in the JS
    // inheritance model — no explicit call needed.
  }

  /**
   * HGAVADeinterlace::~HGAVADeinterlace() [D1 complete] @0x0000000000221380.
   *
   * Body:
   *   0x221386 leaq  0x81005b(%rip), %rax        ; vtbl = 0xa313e8
   *   0x22138d movq  %rax, (%rdi)                ;  reinstall vtbl
   *   0x221390 movq  0x1b0(%rdi), %rax           ; upstream
   *   0x221397 testq %rax, %rax
   *   0x22139a je    0x2213ab
   *   0x22139c movq  (%rax), %rcx                ; vtbl of upstream
   *   0x2213a5 callq *0x18(%rcx)                 ; HGObject::Release
   *   0x2213b1 jmp   HGNode::~HGNode()           ; base tail-call
   *
   * Identical to D2 in observable effect.
   */
  destructD1(): void {
    this.destructD2();
  }

  /**
   * HGAVADeinterlace::~HGAVADeinterlace() [D0 deleting] @0x00000000002213c0.
   *
   * Body:
   *   0x2213c9 leaq  0x810018(%rip), %rax        ; vtbl = 0xa313e8
   *   0x2213d0 movq  %rax, (%rdi)                ;  reinstall vtbl
   *   0x2213d3 movq  0x1b0(%rdi), %rdi           ; upstream
   *   0x2213da testq %rdi, %rdi
   *   0x2213dd je    0x2213e5
   *   0x2213df movq  (%rdi), %rax                ; vtbl of upstream
   *   0x2213e2 callq *0x18(%rax)                 ; HGObject::Release
   *   0x2213e5 callq HGNode::~HGNode()           ; base dtor
   *   0x2213f6 jmp   HGObject::operator delete   ; free `this`
   */
  destructD0(): void {
    this.destructD2();
    // Tail-jump to HGObject::operator delete on `this` — the JS GC
    // handles the actual free.
  }

  /**
   * HGAVADeinterlace::SetParameter(int idx, float a, float b, float c,
   *   float d) @0x0000000000221410.
   *
   * Only the first float `a` (which is passed in %xmm0 by the ABI) is
   * consulted — b/c/d are unused by this override. The return value is
   * u32: 0 if the value was unchanged, 1 if it changed, 0xffffffff if
   * the idx is out of range.
   *
   * Body:
   *   0x221414 cmpl  $0x2, %esi         ; if idx == 2 → premul branch
   *   0x221417 je    0x221453
   *   0x221419 cmpl  $0x1, %esi         ; if idx == 1 → mode branch
   *   0x22141c je    0x221442
   *   0x22141e movl  $0xffffffff, %eax  ; default-return -1
   *   0x221423 testl %esi, %esi         ; if idx != 0 → return -1
   *   0x221425 jne   0x221488
   *
   *   ; idx == 0 (enable branch):
   *   0x221427 xorps %xmm1, %xmm1
   *   0x22142a cmpneqss %xmm1, %xmm0    ; xmm0 = (a != 0.0f) ? all-1 : 0
   *   0x22142f movd  %xmm0, %eax
   *   0x221433 andl  $0x1, %eax          ; eax = (a != 0.0f) ? 1 : 0
   *   0x221436 cmpl  %eax, 0x1a4(%rdi)   ; if(enable == newVal) → return 0
   *   0x22143c jne   0x22147d
   *   0x22143e xorl  %eax, %eax
   *   0x221440 popq  %rbp / retq        ; return 0
   *   0x22147d movl  %eax, 0x1a4(%rdi)   ; enable := newVal
   *   0x221483 movl  $0x1, %eax         ; return 1
   *
   *   ; idx == 1 (mode branch, @0x221442):
   *   0x221442 cvttss2si %xmm0, %rax    ; eax = (int)a (truncation toward 0)
   *   0x221447 cmpl  %eax, 0x198(%rdi)  ; if(mode == newVal) → return 0
   *   0x22144d jne   0x22146d
   *   0x22144f xorl  %eax, %eax / retq
   *   0x22146d movl  %eax, 0x198(%rdi)  ; mode := newVal
   *   0x221473 jmp   0x221483           ; return 1
   *
   *   ; idx == 2 (premul branch, @0x221453):
   *   0x221453 xorps %xmm1, %xmm1
   *   0x221456 ucomiss %xmm1, %xmm0     ; compare a with 0.0f
   *   0x221459 setp  %cl                ; cl = 1 if unordered (NaN)
   *   0x22145c setne %al                ; al = 1 if a != 0.0f (ordered)
   *   0x22145f orb   %cl, %al           ; al = (a != 0.0f) || isNaN(a)
   *   0x221461 cmpb  %al, 0x1a8(%rdi)   ; if(premul == newVal) → return 0
   *   0x221467 jne   0x221475
   *   0x221469 xorl  %eax, %eax / retq
   *   0x221475 movb  %al, 0x1a8(%rdi)   ; premul := newVal
   *   0x22147b jmp   0x221483           ; return 1
   */
  SetParameter(idx: number, a: number, _b: number, _c: number, _d: number): number {
    // Match the x86 float32 semantics exactly: `a` arrives in %xmm0
    // as float32. In JS numbers are float64, but the comparisons and
    // truncations we perform below use ordering that is invariant
    // under float32 → float64 widening (except for cvttss2si, which
    // is a truncation of a float32 value — we simulate by first
    // rounding `a` to float32 via Math.fround).
    const a32 = Math.fround(a);

    if (idx === 2) {
      // premul branch @0x221453.
      // newVal = (a != 0.0f) || isNaN(a) ? 1 : 0
      // ucomiss sets ZF=1 only when a==0 and ordered; setne extracts
      // "not equal or unordered". setp extracts "unordered" (NaN).
      // orb combines them: result is 1 unless a is a normal 0.0.
      const isNaN_a = a32 !== a32;
      const notZero = a32 !== 0;
      const newVal = notZero || isNaN_a ? 1 : 0;
      if (this.premul === newVal) {
        return 0;
      }
      this.premul = newVal;
      return 1;
    }
    if (idx === 1) {
      // mode branch @0x221442. cvttss2si truncates toward zero.
      // The x86 instruction produces INT_MIN for out-of-range /
      // NaN inputs (the "indefinite integer" 0x80000000). We
      // reproduce that faithfully.
      let newVal: number;
      if (a32 !== a32) {
        // NaN → INT_MIN (indefinite integer)
        newVal = -0x80000000 | 0;
      } else if (a32 >= 0x80000000 || a32 < -0x80000000) {
        // out-of-range for int32 → INT_MIN (indefinite integer)
        newVal = -0x80000000 | 0;
      } else {
        newVal = Math.trunc(a32) | 0;
      }
      if (this.mode === newVal) {
        return 0;
      }
      this.mode = newVal;
      return 1;
    }
    if (idx !== 0) {
      // Default-return -1 (as u32: 0xffffffff).
      return 0xffffffff >>> 0;
    }
    // idx == 0: enable branch @0x221427. cmpneqss returns all-ones
    // when a != 0.0f (ordered inequality — NaN comparison is "unordered"
    // which cmpneqss treats as TRUE by default under the cmpneqss
    // predicate=CMP_NEQ_UQ). movd + and 0x1 leaves 1 iff not-equal.
    const newVal = a32 !== 0 || a32 !== a32 ? 1 : 0;
    if (this.enable === newVal) {
      return 0;
    }
    this.enable = newVal;
    return 1;
  }

  /**
   * HGAVADeinterlace::GetOutput(HGRenderer*) @0x0000000000221490.
   *
   * Builds the underlying render-graph subtree for the deinterlacer.
   * This is a large method (672 lines of x86 in
   *  raw-port/re/disasm/Helium.HGAVADeinterlace.GetOutput.s) that
   * allocates an 0x1a0-byte HGNode subclass (via
   * `HGObject::operator new(0x1a0)` @0x2214bd → `HGNode::HGNode()`
   * @0x2214c8 → vtable install at Helium 0x80f194 offset @0x2214cd)
   * plus a 0x127-byte aligned coefficient buffer (via `operator new[]`
   * @0x2214dc, aligned to 32 bytes by the leaq/negl/andl trio at
   * @0x2214e1–0x2214ea), stamps it with a wide constant table
   * initializer (movaps stores over 0x8 .. 0xb8 sourced from Helium
   * constants at 0x1a6726/0x66b2d5/0x66b2d3/0x1a9541/0x1a8a8a/0x1a66d3
   * relative to their instructions), then wires it into the render
   * graph via HGRenderer::GetInput @0x2214af and a chain of downstream
   * HGNode setup calls not decoded here.
   *
   * Callee-frontier trail (from the first 50 lines of the disasm):
   *   • HGRenderer::GetInput(HGNode*, int)         @0x2214af
   *   • HGObject::operator new(unsigned long)      @0x2214bd
   *   • HGNode::HGNode()                           @0x2214c8
   *   • operator new[](unsigned long) (__Znam)     @0x2214dc
   *   • wide-constant tables at Helium offsets:
   *       ripBase 0x22150a + 0x1a6726 = 0x0000000000  ... (recovered
   *       lazily by the resolve.py const pass when this method is
   *       decoded — TODO deep-decode).
   *
   * Deep decode is deferred pending the accompanying HGRenderer /
   * HGNode child-node classes; the caller-visible contract (returning
   * an HGNode*) is captured by the return type below.
   */
  GetOutput(_renderer: HGRendererPtr): HGNode {
    // GetOutput frontier — not yet transcribed @0x0000000000221490
    // (672 lines of setup + graph-wiring; requires HGRenderer::GetInput
    // and the wide-constant tables at Helium offsets to be decoded first).
    throw new Error(
      "HGAVADeinterlace::GetOutput frontier — not yet transcribed @0x0000000000221490 (672-line body pending HGRenderer + wide-constant-table decode)",
    );
  }
}

/** HGObject::Release — @Helium (inherited slot +0x18 on the HGObject
 *  vtable). Frontier stub used by all three dtors when the upstream
 *  HGNode pointer is non-null. */
function HGObject_Release(_obj: HGNode): void {
  // HGObject::Release frontier — not yet transcribed @0x00000000001a0f30
  // (called by HGAVADeinterlace D2 @0x221365 / D1 @0x2213a5 / D0 @0x2213e2
  //  via vtable slot +0x18 on the upstream HGNode).
  throw new Error(
    "HGObject::Release frontier — not yet transcribed @0x00000000001a0f30 (vtable slot +0x18)",
  );
}
