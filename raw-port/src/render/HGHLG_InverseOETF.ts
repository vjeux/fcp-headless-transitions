// raw-port/src/render/HGHLG_InverseOETF.ts
//
// FCP `HGHLG::InverseOETF` — a nested facade class in Helium's `HGHLG`
// (Hybrid Log-Gamma, BT.2100) namespace. It is a THIN wrapper around the
// leaf render node `HgcBT2100_HLG_InverseOETF`: the ctor allocates an
// inner HgcBT2100_HLG_InverseOETF, stashes it at `this+0x198`, and caches
// two f32 constants at `this+0x1a0` (`aa`) and `this+0x1a4` (`cc`) which
// are the leaf shader's exp2-basis reparameterisation of the HLG log-branch
// pre-arg. `GetOutput` then wires up the inner leaf's parameters (the two
// hg_Params slots: hg_Params[0] = (T, invGamma, 0, 0) and hg_Params[1] =
// (aa, cc, 1.0, b)) and returns the inner node as the produced output.
//
// The static helper `HGHLG::InverseOETF::L(double)` @0xffd00 implements
// the *pure math* HLG inverse OETF (in the "12E" normalisation, i.e. the
// returned scalar is 12·E where E is BT.2100 scene linear):
//
//    L(x) = 0                                 if x <= 0
//    L(x) = 4 · x²                            if 0 < x <= 0.5   (= 12·(x²/3))
//    L(x) = exp((x - c) / a) + b              if x >  0.5       (= 12·E)
//
// with the standard BT.2100 HLG constants
//    a = 0.17883277265695     (Helium @0x3d0dc8, f64)
//    b = 0.2846689093722      (Helium @0x3d0dd8, f64)
//    c = 0.5599107277627162   (Helium `HGHLG::InverseOETF::L(double)::c`,
//                              magic-set by cold.1 @0x3c3694 as
//                              0x3fe1eac9e70d7420 — a Meyers-singleton
//                              guarded static double). The linear branch
//                              hard-codes the factor 4 at Helium @0x3d0dd0
//                              (f64 = 4.0), which is 12 · (1/3) — the "12E"
//                              scaling of E = x²/3.
//
// Sanity check at the crossover x = 0.5:
//     linear:  4 · 0.5² = 1.0
//     log:     exp((0.5 - 0.55991073) / 0.17883277) + 0.28466891
//            = exp(-0.335) + 0.28466891
//            ≈ 0.71533 + 0.28467
//            = 1.00000                                     ✓
// At x = 1.0 (peak HLG signal): exp((1 - c)/a) + b
//     = exp(2.46574) + 0.28467  ≈  11.71533 + 0.28467  =  12.00000   ✓
// So L(1) = 12 = "12·E" for E = 1 (peak scene light).
//
// FRAMEWORK: Helium.framework (x86_64 slice; fat-slice offset 0x4000;
// the thin binary at /tmp/Helium.x86_64 has VA==file offset, so every
// RIP-relative constant address below is a direct file offset).
//
// SYMBOLS (Helium x86_64):
//   0x000ffd00  HGHLG::InverseOETF::L(double)               [static — pure HLG inv-OETF math]
//   0x003c3680  HGHLG::InverseOETF::L(double) (.cold.1)     [guarded init of static `c`]
//   0x000ffd90  HGHLG::InverseOETF::InverseOETF()           [C2 base ctor]
//   0x000ffe70  HGHLG::InverseOETF::InverseOETF()           [C1 complete ctor — tail-jmps into C2]
//   0x003c36c0  HGHLG::InverseOETF::InverseOETF() (.cold.1) [guarded init of static `c`]
//   0x003c3700  HGHLG::InverseOETF::InverseOETF() (.cold.2) [guarded init of static `aa`]
//   0x003c3730  HGHLG::InverseOETF::InverseOETF() (.cold.3) [guarded init of static `cc`]
//   0x000ffe80  HGHLG::InverseOETF::~InverseOETF()          [D2 base dtor]
//   0x000ffec0  HGHLG::InverseOETF::~InverseOETF()          [D1 complete dtor — identical body to D2]
//   0x000fff00  HGHLG::InverseOETF::~InverseOETF()          [D0 deleting dtor]
//   0x000fff50  HGHLG::InverseOETF::GetOutput(HGRenderer*)  [wires HgcBT2100_HLG_InverseOETF params]
//
// DECODES (all under raw-port/re/disasm/):
//   Helium.HGHLG::InverseOETF.L.s                             (@0xffd00)
//   Helium.HGHLG::InverseOETF.GetOutput.s                     (@0xfff50)
//   Helium.HGHLG_InverseOETF.__ZN5HGHLG11InverseOETFC1Ev.s    (@0xffe70)
//   Helium.HGHLG_InverseOETF.__ZN5HGHLG11InverseOETFC2Ev.s    (@0xffd90)
//   Helium.HGHLG_InverseOETF.__ZN5HGHLG11InverseOETFD0Ev.s    (@0xfff00)
//   Helium.HGHLG_InverseOETF.__ZN5HGHLG11InverseOETFD1Ev.s    (@0xffec0)
//   Helium.HGHLG_InverseOETF.__ZN5HGHLG11InverseOETFD2Ev.s    (@0xffe80)
//
// LAYOUT (inherits HGNode; sizeof HGNode header >= 0x1a8):
//   +0x000  vtable ptr                             (installed @0xffda2/@0xffda9 via
//                                                   `leaq 0x917397(%rip), %rax` — the
//                                                   HGHLG::InverseOETF vtable copy)
//   +0x198  HgcBT2100_HLG_InverseOETF* inner       (allocated by ctor @0xffdac..0xffdbc:
//                                                   `HGObject::operator new(0x1a0)` +
//                                                   `HgcBT2100_HLG_InverseOETF::HgcBT2100_HLG_InverseOETF()`)
//   +0x1a0  float32 aa                             (cached exp2-basis slope; set by ctor
//                                                   @0xffde9/@0xffdf1 from static `aa`).
//                                                   VALUE: 8.067285537719727f  (bits 0x4101139a,
//                                                   Helium cold.2 @0x3c3714).  Derivation:
//                                                     aa = 1 / (a · ln 2)
//                                                        = 1 / (0.17883277 · 0.69314718)
//                                                        = 1 / 0.123957432158883
//                                                        ≈ 8.067285538
//                                                   i.e. `exp(u/a) = 2^(u/(a·ln2)) = 2^(aa·u)`.
//   +0x1a4  float32 cc                             (cached exp2-basis offset; set by ctor
//                                                   @0xffdf9/@0xffe01 from static `cc`).
//                                                   VALUE: -4.516959667205811f.  Derivation
//                                                   (Helium cold.3 @0x3c3744..@0x3c3758):
//                                                     cc = f32(  c_static / (Helium @0x3d0f30)  )
//                                                        = f32(  0.5599107277627162 / -0.12395743215888257  )
//                                                        = f32( -4.51695966718... )
//                                                        ≈ -4.5169596672058105f
//                                                   Note (Helium @0x3d0f30 = -0.12395743...):
//                                                     -0.12395743 = -(a · ln 2) = -1/aa (as f64).
//                                                   So cc = -c/(a·ln2) = -c·aa, and the leaf
//                                                   log-branch pre-arg is
//                                                     aa·x + cc  =  aa·(x - c)  =  (x - c)/(a·ln2)
//                                                   hence  2^(aa·x + cc) = exp((x - c)/a).
//
// DECODED CONSTANTS (from Helium.x86_64 with VA==file offset; every
// RIP-relative constant is next_ip + disp32):
//
//   HGHLG::InverseOETF::L(double) @0xffd00 (all f64 — 8-byte movsd/mulsd/divsd/subsd):
//     `c` static local double @Helium bss 0xaddf00, magic-set by cold.1
//       @0x3c3694 to 0x3fe1eac9e70d7420 = 0.5599107277627162 (HLG constant c).
//     0x3cc1c0 : 0.5                    (crossover threshold; @0xffd40)
//     0x3d0dc8 : 0.17883277265695       (= a, HLG log-branch slope)                @0xffd56
//     0x3d0dd0 : 4.0                    (= 12·(1/3); linear-branch scale for "12E")@0xffd79
//     0x3d0dd8 : 0.2846689093722        (= b, HLG log-branch DC term)              @0xffd67
//
//   HGHLG::InverseOETF::GetOutput @0xfff50 (all f32 — 4-byte movss):
//     0x3c7cc8 : 0.5f                   (= T, threshold — hg_Params[0].x)          @0xfff86
//     0x3ca2ec : 4.0f                   (= 12·(1/3), linear scale — hg_Params[0].y)@0xfff8e
//     0x3c7cc0 : 1.0f                   (= exp2 multiplier — hg_Params[1].z)       @0xfffbb
//     0x3d0fa0 : 0.2846689224243164f    (= f32(b) — hg_Params[1].w)                @0xfffc3
//
// The four hg_Params delivered to the inner HgcBT2100_HLG_InverseOETF are:
//     hg_Params[0] = (0.5,      4.0,     0.0,     0.0)
//     hg_Params[1] = (aa=8.067, cc=-4.517, 1.0,   b=0.2847)
// which in the leaf shader's form (E = c·2^(a·r + b) + d for r > T,
// E = invGamma·r² for r ≤ T) reproduce exactly
//     E = r²·4                           for r ≤ 0.5
//     E = 1·2^(aa·r + cc) + b            for r >  0.5
// which is the "12E" HLG inverse OETF above.
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()                              @Helium 0xffd9d
//   HGObject::operator new(size_t)                @Helium 0xffdb1
//   HgcBT2100_HLG_InverseOETF::HgcBT2100_HLG_InverseOETF()  @Helium 0xffdbc
//   HGObject::operator delete(void*)              @Helium 0xffe41 / 0xfff36
//   HGNode::~HGNode()                             @Helium 0xffe49 / 0xffe5c / 0xffeb1 / 0xffef1 / 0xfff28
//   HgcBT2100_HLG_InverseOETF vtable +0x18 (dtor slot) @0xffea5 / 0xffee5 / 0xfff22
//   HGRenderer::GetInput(HGNode*, int)            @Helium 0xfff69
//   HgcBT2100_HLG_InverseOETF vtable +0x78 (SetInput slot)      @Helium 0xfff79
//   HgcBT2100_HLG_InverseOETF vtable +0x60 (SetParameter slot)  @Helium 0xfff9e / 0xfffd0
//   `HGHLG::InverseOETF::L(double)::c` guarded-static init (Meyers singleton)
//     @Helium cold.1 0x3c3680 — `__cxa_guard_acquire` / `__cxa_guard_release`
//     (the DOUBLE bit-pattern 0x3fe1eac9e70d7420 = 0.5599107277627162 IS
//     transcribed as an eagerly-initialised constant here; the guard itself
//     is a runtime-once side-effect that JS/TS gets for free.)
//   `HGHLG::InverseOETF::InverseOETF()::aa/cc` guarded-static init
//     @Helium cold.2 0x3c3700 / cold.3 0x3c3730 — same story: the f32 bit
//     patterns 0x4101139a (aa) and f32(c/-0.12395743) (cc) are baked in.
//
// The two vtable slots at +0x60 and +0x78 on `HgcBT2100_HLG_InverseOETF`
// match the canonical `HGNode` vtable layout (see HGNode.ts: *0x60 =
// `HGNode::SetParameter(int, float, float, float, float)`, *0x78 =
// `HGNode::SetInput(int, HGNode*)`). The dispatch here is faithful to the
// asm: we don't collapse it into a string-enum.

/* ------------------------------------------------------------------ */
/* Opaque frontier types — resolved by companion ports.                */
/* ------------------------------------------------------------------ */

export interface HGRenderer {}
export interface HGNodeLike {}

/* ------------------------------------------------------------------ */
/* Undecoded-frontier stubs (each throws with its @0xADDR).            */
/* ------------------------------------------------------------------ */

/** Base-class ctor called by C2 @Helium 0xffd9d (C1 tail-jmps into C2). */
function HGNode_ctor_call(_self: object): void { // @Helium 0xffd9d
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0xffd9d — HGHLG::InverseOETF C2 base-call)",
  );
}

/** `HGObject::operator new(0x1a0)` allocates the inner HgcBT2100_HLG_InverseOETF. */
function HGObject_operator_new(_bytes: number): object { // @Helium 0xffdb1
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed (@Helium 0xffdb1 — HGHLG::InverseOETF ctor alloc of inner HgcBT2100_HLG_InverseOETF)",
  );
}

/** `HgcBT2100_HLG_InverseOETF::HgcBT2100_HLG_InverseOETF()` — leaf render-node ctor. */
function HgcBT2100_HLG_InverseOETF_ctor(_p: object): void { // @Helium 0xffdbc
  throw new Error(
    "HgcBT2100_HLG_InverseOETF::HgcBT2100_HLG_InverseOETF() not yet transcribed (@Helium 0xffdbc — HGHLG::InverseOETF ctor inner-node construction)",
  );
}

/** `HGRenderer::GetInput(HGNode*, int)` fetches the primary input node. */
function HGRenderer_GetInput(
  _r: HGRenderer, _n: HGNodeLike, _idx: number,
): HGNodeLike { // @Helium 0xfff69
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed (@Helium 0xfff69 — HGHLG::InverseOETF::GetOutput source-input fetch)",
  );
}

/**
 * Virtual dispatch through the inner HgcBT2100_HLG_InverseOETF's vtable
 * +0x78 (`HGNode::SetInput(int, HGNode*)` per HGNode's canonical vtable).
 */
function HgcBT2100_HLG_InverseOETF_SetInput(
  _inner: object,
  _slot: number,
  _source: HGNodeLike,
): void { // @Helium 0xfff79 (vtable +0x78)
  throw new Error(
    "HgcBT2100_HLG_InverseOETF vtable +0x78 (HGNode::SetInput) not yet transcribed (@Helium 0xfff79 — HGHLG::InverseOETF::GetOutput input wiring)",
  );
}

/**
 * Virtual dispatch through the inner HgcBT2100_HLG_InverseOETF's vtable
 * +0x60 (`HGNode::SetParameter(int, float, float, float, float)` per
 * HGNode's canonical vtable).
 */
function HgcBT2100_HLG_InverseOETF_SetParameter(
  _inner: object,
  _slot: number,
  _x: number,
  _y: number,
  _z: number,
  _w: number,
): void { // @Helium 0xfff9e / 0xfffd0 (vtable +0x60)
  throw new Error(
    "HgcBT2100_HLG_InverseOETF vtable +0x60 (HGNode::SetParameter) not yet transcribed (@Helium 0xfff9e / 0xfffd0 — HGHLG::InverseOETF::GetOutput param upload)",
  );
}

/* ------------------------------------------------------------------ */
/* HGHLG::InverseOETF                                                  */
/* ------------------------------------------------------------------ */

/**
 * `HGHLG::InverseOETF` — BT.2100 Hybrid Log-Gamma electro-optical
 * inverse-OETF facade. Nested inside the `HGHLG` C++ namespace in FCP;
 * we expose it as a plain TS class named `HGHLG_InverseOETF`.
 */
export class HGHLG_InverseOETF {
  /**
   * +0x198 — pointer to the leaf `HgcBT2100_HLG_InverseOETF` render node
   * the class wraps. Allocated in the ctor via
   * `HGObject::operator new(0x1a0)` +
   * `HgcBT2100_HLG_InverseOETF::HgcBT2100_HLG_InverseOETF()`
   * @Helium 0xffdb1..0xffdc1.
   */
  public inner: object;

  /**
   * +0x1a0 — float32 exp2-basis slope. Reads the guarded-static `aa`
   * @Helium 0xffde9 (bits 0x4101139a = 8.067285537719727f).
   * See file header for derivation `aa = 1 / (a · ln 2)`.
   */
  public aa: number;

  /**
   * +0x1a4 — float32 exp2-basis offset. Reads the guarded-static `cc`
   * @Helium 0xffdf9 (f32(c/-0.12395743) ≈ -4.516959667205811f).
   * See file header for derivation `cc = -c / (a · ln 2)`.
   */
  public cc: number;

  /* ---------------- static: pure HLG inverse-OETF math ------------ */

  /**
   * HGHLG::InverseOETF::L(double) — Helium @0xffd00. Reference (f64)
   * implementation of the BT.2100 HLG inverse OETF in the "12E"
   * normalisation. Body transcribed line-for-line from the disasm
   * (raw-port/re/disasm/Helium.HGHLG::InverseOETF.L.s):
   *
   *   @0xffd08  movapd %xmm0, %xmm1                ; xmm1 = x (double)
   *   @0xffd0c  movzbl guard(c), %eax
   *   @0xffd13  testb %al, %al ; je cold.1         ; run cold.1 once to
   *                                                  Meyers-init the static
   *                                                  double `c`. In TS we
   *                                                  fold that init in as
   *                                                  an eager constant.
   *   @0xffd17  xorpd %xmm0, %xmm0                 ; xmm0 = 0.0
   *   @0xffd1b  ucomisd %xmm1, %xmm0               ; flags for (0 - x)
   *   @0xffd1f  jb 0xffd40                         ; branch if 0 < x
   *                                                  (i.e. x > 0). NaN goes
   *                                                  to fall-through (jb
   *                                                  requires CF=1 which
   *                                                  ucomisd unordered
   *                                                  does set to 1 for
   *                                                  NaN — but we mirror
   *                                                  via `x > 0` which
   *                                                  is FALSE for NaN, so
   *                                                  NaN returns 0. Note
   *                                                  the raw asm treats
   *                                                  NaN as "take the jb"
   *                                                  because ucomisd
   *                                                  unordered sets CF=1;
   *                                                  in TS we handle NaN
   *                                                  explicitly below.)
   *   @0xffd21  addq $0x10,%rsp ; popq %rbp ; retq ; ret 0.0 (xmm0 is 0)
   *
   *   @0xffd40  movsd 0.5(%rip), %xmm0
   *   @0xffd48  ucomisd %xmm1, %xmm0               ; flags for (0.5 - x)
   *   @0xffd4c  jae 0xffd75                        ; jump if 0.5 >= x
   *                                                  (i.e. x <= 0.5) → linear
   *
   *   ; LOG branch (x > 0.5):
   *   @0xffd4e  subsd c(%rip), %xmm1               ; xmm1 = x - c
   *   @0xffd56  divsd a(%rip), %xmm1               ; xmm1 = (x - c)/a
   *   @0xffd5e  movapd %xmm1, %xmm0
   *   @0xffd62  callq _exp                         ; xmm0 = exp((x - c)/a)
   *   @0xffd67  addsd b(%rip), %xmm0               ; xmm0 = exp((x-c)/a) + b
   *   @0xffd6f  addq $0x10,%rsp ; popq %rbp ; retq
   *
   *   ; LINEAR branch (0 < x <= 0.5):
   *   @0xffd75  mulsd %xmm1, %xmm1                 ; xmm1 = x²
   *   @0xffd79  mulsd 4.0(%rip), %xmm1             ; xmm1 = 4·x²
   *   @0xffd81  movapd %xmm1, %xmm0
   *   @0xffd85..0xffd8a  ret
   *
   * NaN semantics: the raw asm's first `ucomisd`+`jb` sends NaN to the
   * LOG branch (jb fires when CF=1 which ucomisd sets for unordered).
   * At the LOG branch NaN propagates through subsd/divsd/exp/addsd →
   * returns NaN. That matches TS `Math.exp(NaN) = NaN` if we route NaN
   * to the LOG branch. Using `x > 0` in JS returns FALSE for NaN which
   * would route NaN to `return 0` — divergent from the asm. To stay
   * faithful we test with `!(x <= 0)` which is TRUE for NaN, taking the
   * same path as `jb` in the disasm.
   */
  public static L(x: number): number { // @Helium 0xffd00
    // @0xffd17-@0xffd1f: `xorpd xmm0,xmm0 ; ucomisd xmm1(=x),xmm0(=0) ; jb`
    // jb fires when CF=1: ucomisd sets CF=1 for (0 < x) OR unordered (NaN).
    // Fall-through (x <= 0, ordered) returns 0. Mirror with `!(x > 0)`:
    // this is TRUE for x <= 0 (ordered) AND TRUE for NaN → matches asm
    // (NaN takes fall-through path? — no: jb fires for NaN too, so NaN
    // goes to the log branch). Use `!(x > 0)` misses NaN. Instead use
    // `x <= 0` explicitly: FALSE for NaN → falls into the "jb taken"
    // path along with (x > 0). This matches the disasm exactly.
    if (x <= 0) {
      // @0xffd21..0xffd26: return 0.0 (xmm0 zeroed at 0xffd17)
      return 0;
    }
    // (x > 0 OR NaN — the log/linear branching below treats NaN via
    // `x <= 0.5`, which is FALSE for NaN, so NaN falls into the log
    // branch and propagates through Math.exp — matches asm.)

    // Meyers-singleton static: HGHLG::InverseOETF::L(double)::c.
    // Set exactly once by cold.1 @0x3c3694 to
    // 0x3fe1eac9e70d7420 = 0.5599107277627162. Eagerly folded here.
    const c = 0.5599107277627162; // Helium bit-pattern 0x3fe1eac9e70d7420

    // @0xffd40-@0xffd4c: `movsd 0.5,xmm0 ; ucomisd xmm1(=x),xmm0(=0.5) ; jae`
    // jae fires when CF=0: (0.5 >= x, ordered). Falls through (log branch)
    // when x > 0.5 or unordered (NaN). Mirror with `x <= 0.5` which is
    // FALSE for NaN — routes NaN to log branch, matching asm.
    if (x <= 0.5) {
      // LINEAR branch — @0xffd75..0xffd8a:
      //   xmm1 = x·x                                @0xffd75
      //   xmm1 *= 4.0  (from Helium @0x3d0dd0)      @0xffd79
      //   ret xmm0 = xmm1
      // 4.0 is 12·(1/3): this outputs 12·E where E = x²/3 is the true
      // HLG inverse-OETF linear branch. The class carries the "12E"
      // scaling so downstream OOTF sees luminance in [0, 12].
      return x * x * 4.0; // 4.0 @Helium 0x3d0dd0
    }

    // LOG branch — @0xffd4e..0xffd74:
    //   xmm1 = x - c                                @0xffd4e (c static)
    //   xmm1 = (x - c) / a                          @0xffd56 (a = 0.17883277)
    //   xmm0 = exp(xmm1)                            @0xffd62 (_exp)
    //   xmm0 = exp(...) + b                         @0xffd67 (b = 0.28466891)
    //   return xmm0
    const a = 0.17883277265695;   // Helium @0x3d0dc8 (f64)
    const b = 0.2846689093722;    // Helium @0x3d0dd8 (f64)
    return Math.exp((x - c) / a) + b;
  }

  /* ---------------- ctor: HGHLG::InverseOETF() ------------------ */

  /**
   * HGHLG::InverseOETF::InverseOETF() — Helium @0xffd90 (C2) / @0xffe70
   * (C1). The C1 body @0xffe70 is a bare `push %rbp ; mov %rsp,%rbp ;
   * pop %rbp ; jmp C2` — a plain tail-call into the C2 body. So we
   * transcribe C2 only.
   *
   * C2 body (@0xffd90..@0xffe13):
   *
   *   HGNode::HGNode(this);                          @0xffd9d
   *   this->vtable = &_ZTVN5HGHLG11InverseOETFE     @0xffda2/@0xffda9
   *   raw = HGObject::operator new(0x1a0);           @0xffdac-@0xffdb1
   *   HgcBT2100_HLG_InverseOETF::ctor(raw);          @0xffdbc
   *   this->0x198 = raw;                             @0xffdc1
   *
   *   ; Guarded static init of Meyers-singleton `c` (f64):
   *   if (!guard[c]) { cold.1 initialises c := 0x3fe1eac9e70d7420 }   @0xffdc8-@0xffe14
   *   ; Guarded static init of Meyers-singleton `aa` (f32):
   *   if (!guard[aa]) { cold.2 initialises aa := f32-bits 0x4101139a } @0xffdd3-@0xffe24
   *   ; Guarded static init of Meyers-singleton `cc` (f32):
   *   if (!guard[cc]) { cold.3 initialises cc := f32(c / (Helium @0x3d0f30)) } @0xffdde-@0xffe34
   *
   *   xmm0 = static aa (f32)                         @0xffde9
   *   this->0x1a0 = xmm0                             @0xffdf1  (movss)
   *   xmm0 = static cc (f32)                         @0xffdf9
   *   this->0x1a4 = xmm0                             @0xffe01  (movss)
   *
   * The three cold.* helpers implement the C++ Meyers-singleton pattern
   * (`__cxa_guard_acquire` / release around a bit-pattern store). In
   * JS/TS the singleton is trivially available: we eagerly bake the
   * three constants below and skip the guard machinery.
   *
   * The unwind tails @0xffe3b..0xffe66 are exception cleanup: if the
   * inner-node ctor throws they call HGObject::operator delete +
   * HGNode::~HGNode + __Unwind_Resume. In the TS port the inner ctor
   * is a throw-stub, so any exception simply propagates.
   */
  public constructor() { // @Helium 0xffd90 (C2)  / 0xffe70 (C1 — tail-jmp into C2)
    HGNode_ctor_call(this);
    // vtable install @0xffda2/@0xffda9 — modelled as a no-op here; the
    // vtable resolves through explicit method calls on this object.

    // HGObject::operator new(0x1a0) @0xffdb1 -> raw = %rax
    const raw = HGObject_operator_new(0x1a0);
    // HgcBT2100_HLG_InverseOETF::HgcBT2100_HLG_InverseOETF(raw) @0xffdbc
    HgcBT2100_HLG_InverseOETF_ctor(raw);
    // this->0x198 = raw @0xffdc1
    this.inner = raw;

    // Cached (Meyers-singleton) statics — folded in eagerly:
    //   aa (f32) — Helium cold.2 @0x3c3714 writes u32 0x4101139a.
    //     bit-pattern → f32 == 8.067285537719727f == 1/(a·ln2).
    this.aa = Math.fround(8.067285537719727); // @0xffde9 / @0xffdf1 → this->0x1a0

    //   cc (f32) — Helium cold.3 @0x3c3754 computes f32(c / -0.12395743).
    //     Result: -4.5169596672058105f == -c/(a·ln2).
    this.cc = Math.fround(-4.516959667205811); // @0xffdf9 / @0xffe01 → this->0x1a4
  }

  /* ---------------- dtor: HGHLG::~InverseOETF ------------------- */

  /**
   * HGHLG::InverseOETF::~InverseOETF() — Helium @0xffe80 (D2), @0xffec0
   * (D1), @0xfff00 (D0 deleting). All three bodies re-install the
   * base HGHLG::InverseOETF vtable at (this), then load the inner
   * HgcBT2100_HLG_InverseOETF pointer from this+0x198 and — if
   * non-null — call *(inner_vtable + 0x18)(inner). Finally D1/D2 tail-
   * jmp to HGNode::~HGNode(); D0 additionally tail-jmps to
   * HGObject::operator delete(this).
   *
   *   D2 @0xffe80:
   *     this->vtable = &vt         @0xffe86/@0xffe8d
   *     inner = this->0x198        @0xffe90
   *     if (inner) call inner->vt[0x18](inner)   @0xffe97..@0xffea8
   *     tail-jmp HGNode::~HGNode(this)           @0xffeb1
   *
   *   D1 @0xffec0: byte-identical body to D2 modulo the vtable disp
   *     (@0xffec6).
   *
   *   D0 @0xfff00:
   *     same free sequence, then tail-jmp HGObject::operator delete
   *     @0xfff36.
   *
   * The inner-node's vtable slot +0x18 is `~HgcBT2100_HLG_InverseOETF()`
   * (per HGNode's canonical vtable: *0x18 = D0 deleting dtor). JS/TS
   * doesn't have manual delete; the whole ownership graph is subsumed
   * by GC. We model destroy() as a manual method for symmetry with the
   * port. (If a caller ever needs a semantic dtor beyond GC — e.g. to
   * trigger the vtable+0x18 call for parity — swap the body for a
   * throw citing @Helium 0xffea5 / 0xffee5 / 0xfff22.)
   */
  public destroy(): void { // @Helium 0xfff00 (D0)
    void this.inner;
  }

  /* ---------------- GetOutput ---------------------------------- */

  /**
   * HGHLG::InverseOETF::GetOutput(HGRenderer* r) — Helium @0xfff50.
   * Transcription:
   *
   *   inner = this->0x198;                                     @0xfff5a
   *   source = HGRenderer::GetInput(r, this, 0);               @0xfff69
   *   vt = *(void**)inner;
   *   (*(void(**)(void*, int, HGNode*))(vt+0x78))(inner, 0, source);   @0xfff79
   *   // ^ HGNode::SetInput slot on the inner HgcBT2100_HLG_InverseOETF
   *
   *   inner = this->0x198;                                     @0xfff7c
   *   vt = *(void**)inner;
   *   xmm0 = f32(0.5)  @0x3c7cc8                               @0xfff86
   *   xmm1 = f32(4.0)  @0x3ca2ec                               @0xfff8e
   *   xmm2 = 0 ; xmm3 = 0                                      @0xfff96/@0xfff99
   *   (*(void(**)(void*, int, float, float, float, float))(vt+0x60))
   *     (inner, 0, 0.5, 4.0, 0, 0);                            @0xfff9e
   *   // ^ HGNode::SetParameter(0, {T=0.5, invGamma=4.0, 0, 0})
   *
   *   inner = this->0x198;                                     @0xfffa1
   *   xmm0 = this->0x1a0  (=aa, f32)                           @0xfffa8
   *   xmm1 = this->0x1a4  (=cc, f32)                           @0xfffb0
   *   vt = *(void**)inner;
   *   xmm2 = f32(1.0)  @0x3c7cc0                               @0xfffbb
   *   xmm3 = f32(0.28466892)  @0x3d0fa0                        @0xfffc3
   *   (*(void(**)(void*, int, float, float, float, float))(vt+0x60))
   *     (inner, 1, aa, cc, 1.0, b);                            @0xfffd0
   *   // ^ HGNode::SetParameter(1, {aa, cc, 1.0, b=0.28466892})
   *
   *   return this->0x198;                                      @0xfffd3
   *
   * i.e. GetOutput binds the source input and the HLG-inverse-OETF
   * parameters onto the leaf HgcBT2100_HLG_InverseOETF and returns
   * that leaf as the produced output node. All four vtable calls
   * (GetInput, SetInput slot, two SetParameter slots) are frontier —
   * see the throwing stubs above. Once HGRenderer +
   * HgcBT2100_HLG_InverseOETF land, this method is fully wired without
   * further changes.
   */
  public GetOutput(r: HGRenderer): object { // @Helium 0xfff50
    // inner = this->0x198  @0xfff5a
    const inner = this.inner;

    // source = HGRenderer::GetInput(r, this, 0)  @0xfff69
    const source = HGRenderer_GetInput(r, this as unknown as HGNodeLike, 0);

    // inner->vtable[0x78](inner, 0, source)  @0xfff79
    HgcBT2100_HLG_InverseOETF_SetInput(inner, 0, source);

    // inner->vtable[0x60](inner, 0, 0.5, 4.0, 0, 0)   @0xfff9e
    // Constants @0x3c7cc8 (0.5) and @0x3ca2ec (4.0) — both f32.
    HgcBT2100_HLG_InverseOETF_SetParameter(
      inner,
      0,
      Math.fround(0.5),  // f32 T          @0x3c7cc8
      Math.fround(4.0),  // f32 invGamma   @0x3ca2ec
      Math.fround(0.0),
      Math.fround(0.0),
    );

    // inner->vtable[0x60](inner, 1, aa, cc, 1.0, b)  @0xfffd0
    // aa/cc from this->0x1a0/0x1a4 (loaded @0xfffa8/@0xfffb0);
    // 1.0 @0x3c7cc0, b @0x3d0fa0 — both f32.
    HgcBT2100_HLG_InverseOETF_SetParameter(
      inner,
      1,
      this.aa,                              // f32 this->0x1a0
      this.cc,                              // f32 this->0x1a4
      Math.fround(1.0),                     // f32 exp2 scale  @0x3c7cc0
      Math.fround(0.2846689224243164),      // f32 b           @0x3d0fa0
    );

    // return this->0x198  @0xfffd3
    return this.inner;
  }
}
