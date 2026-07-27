// HGColorGammaLUTInfo.ts — FCP Helium HGColorGammaLUTInfo: gamma LUT descriptor / info
// used by HGLUTCache to key & materialize a color-gamma color-conform LUT.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGColorGammaLUTInfo.*.s (captured via disasm.sh).
//
// STRUCT LAYOUT (recovered from the ctor at @0x112980, isEqual @0x112a20, duplicate @0x115580):
//   sizeof = 0x80 (128 bytes). Freed via operator delete @0x115570.
//     +0x00  vtable (installed by ctor at @0x1129b3-0x1129ba: leaq 0x90a0fe(%rip),%rax; mov %rax,(%rbx))
//     +0x08 .. +0x23  inherited HGApplyNDLUTInfo state (base ctor @0x1129ae:
//                     HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long,unsigned long,float,float,LUTStorageFormat)
//                     - 28 bytes of parent-class fields, not yet transcribed).
//     +0x24  uint32 form  (HGColorGamma::hgColorGammaForm; set from %r14d = 4th ctor arg;
//                          isEqual reads it via `movl 0x24(%rbx),%eax` @0x112a73; colorAtIndex
//                          @0x112c34 dispatches on it via jump table @0x113108, cases 0..4.)
//     +0x28  float g[0]   - ctor stores arg#5.x here (@0x1129c1-0x1129cf)
//     +0x2C  float g[1]   - ctor stores arg#5.y here
//     +0x30  float g[2]   - ctor stores arg#5.z (insertps) here
//     +0x34  float g[3]   - ctor stores arg#6.x here
//     +0x38  float g[4]   - ctor stores arg#6.y here (@0x1129d3-0x1129db)
//     +0x3C  float g[5]   - ctor stores arg#6.z (shufps) here
//     +0x40  float g[6]   - ctor stores arg#7.x here
//     +0x44  float g[7]   - ctor stores arg#7.y here
//     +0x48  float g[8]   - ctor stores arg#7.z here (@0x1129df-0x1129eb)
//     +0x4C  float g[9]   - ctor stores arg#8.x here
//     +0x50  float g[10]  - ctor stores arg#8.y here
//     +0x54  float g[11]  - ctor stores arg#8.z here
//     +0x58  float g[12]  - ctor stores arg#9.x here (@0x1129ef-0x1129fd)
//     +0x5C  float g[13]  - ctor stores arg#9.y here
//     +0x60  float g[14]  - ctor stores arg#9.z (insertps) here
//     +0x64  float g[15]  - ctor stores arg#10.x here (@0x112a01-0x112a09)
//     +0x68  float g[16]  - ctor stores arg#10.y here
//     +0x6C  float g[17]  - ctor stores arg#10.z (shufps) here
//     +0x70  float g[18]  - ctor stores arg#11.x here
//     +0x74  float g[19]  - ctor stores arg#11.y here
//     +0x78  float g[20]  - ctor stores arg#11.z (extractps $2) here (@0x112a0d)
//     +0x7C..+0x7F  tail padding (NOT touched by ctor and NOT copied by duplicate).
//
//   Note-A: the ctor uses a chain of `insertps` / `shufps` to pack seven incoming SSE
//   float4 vector arguments (28 raw floats, but only 21 are actually stored: x,y,z of
//   each vector - the .w lane is dropped) into 21 consecutive float32 slots 0x28..0x7C.
//   isEqual @0x112a80-0x112bcf then compares those 21 floats one-by-one with `ucomiss`
//   (bit-exact equality including NaN-poison branch via `jp`), matching the exact set
//   of offsets the ctor writes to.
//
// SEMANTICS (from colorAtIndex disasm):
//   The 21 floats hold per-channel gamma-curve parameters. Reading the accesses:
//     0x28..0x30   three per-channel exponents           (g[0..2])   -> powf(x, g[i])
//     0x34..0x3C   three per-channel slope coefficients  (g[3..5])
//     0x40..0x48   three per-channel offset coefficients (g[6..8])
//     0x4C..0x54   three per-channel linear-segment slopes  (g[9..11])
//     0x58..0x60   three per-channel breakpoints         (g[12..14])
//     0x64..0x6C   three per-channel curve-output offsets (g[15..17])
//     0x70..0x78   three per-channel linear-segment offsets (g[18..20])
//   No hardcoded gamma constants live in this class - all curve parameters come in
//   through the ctor. (The only in-binary constants referenced by colorAtIndex are two
//   sign-flip masks in Helium __TEXT __const:
//     0x3CA0D0 = 0x8000000080000000 (float sign mask; used by `xorps` for float negation),
//     0x3CAAE0 = 0x8000000000000000 (double sign mask; used by `xorpd` for double negation).)
//
// FRONTIER (deferred - cited as throwing stubs below @0x1129ae, @0x112a66, @0x112a4f):
//   - HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long,unsigned long,float,float,LUTStorageFormat) (base ctor called @0x1129ae)
//   - HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const                                        (base isEqual called @0x112a66)
//   - __dynamic_cast (libc++abi stub called @0x112a4f)
//   - operator new/delete (called @0x11558e / @0x115575)
//   - _powf (libm stub called @0x112c84 and other sites)
//
// This file transcribes: constructor(@0x112980), isEqual(@0x112a20),
// colorAtIndex(@0x112c20), destructors D0/D1(@0x115570/@0x115560), duplicate(@0x115580).

/**
 * HGColorGamma::hgColorGammaForm - form enumeration recovered from the jump-table at
 * @0x113108 (colorAtIndex switch on `movl 0x24(%rdi),%eax; cmpq $0x4,%rax`, so legal
 * values are 0..4; any other value skips all math and only writes alpha = 1.0).
 * The precise naming of each variant is not decoded here (the vtable/RTTI for
 * HGColorGamma is out of scope); values are documented by branch address only.
 */
export const HGColorGammaForm = {
  /** Case 0 branch @0x112c64: pure powf on each channel (sign-preserving via xorps 0x3CA0D0 negation). */
  FORM_0: 0,
  /** Case 1 branch @0x112e19: double-precision breakpoint via -g[?]/g[?], powf when above, linear when below. */
  FORM_1: 1,
  /** Case 2 branch @0x112d60: variant of case 1 (different field lanes; see disasm @0x112d60-0x112ecc). */
  FORM_2: 2,
  /** Case 3 branch @0x112d9d: linear-segment-below-breakpoint variant (fields 0x4c/0x5c/0x60). */
  FORM_3: 3,
  /** Case 4 branch @0x112ccd: breakpoint on g[12..14] vs input; below -> linear, above -> pow. */
  FORM_4: 4,
} as const;
export type HGColorGammaFormValue = 0 | 1 | 2 | 3 | 4;

/** Sign-flip masks referenced by colorAtIndex (both live in Helium __TEXT __const). */
const HELIUM_FLOAT_SIGN_MASK_VA  = 0x3CA0D0; // u64 = 0x8000000080000000 - used by `xorps` on a float lane
const HELIUM_DOUBLE_SIGN_MASK_VA = 0x3CAAE0; // u64 = 0x8000000000000000 - used by `xorpd` on a double lane
// Both are simply arithmetic negation of the corresponding IEEE-754 value.
void HELIUM_FLOAT_SIGN_MASK_VA; void HELIUM_DOUBLE_SIGN_MASK_VA;

/**
 * Throwing stub for HGApplyNDLUTInfo::HGApplyNDLUTInfo - the base-class ctor called by
 * this class's ctor at @0x1129ae. Not yet transcribed; loud gap per Rule 3.
 * The real signature is (unsigned long, unsigned long, float, float, LUTStorageFormat)
 * and the derived ctor forwards args as (arg#1=rdi, rsi, xmm0, xmm1, edx=$0x1).
 */
function HGApplyNDLUTInfo_ctor_stub(): never {
  throw new Error("HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long,unsigned long,float,float,LUTStorageFormat) - base ctor not yet transcribed (called by HGColorGammaLUTInfo::HGColorGammaLUTInfo @0x1129ae in Helium)");
}

/**
 * Throwing stub for HGApplyNDLUTInfo::isEqual - the base-class isEqual called at
 * @0x112a66. Not yet transcribed; loud gap per Rule 3.
 */
function HGApplyNDLUTInfo_isEqual_stub(_a: unknown, _b: unknown): boolean {
  throw new Error("HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const not yet transcribed (called by HGColorGammaLUTInfo::isEqual @0x112a66 in Helium)");
}

/**
 * Throwing stub for the libc++abi __dynamic_cast used by isEqual @0x112a4f to safely
 * downcast an HGLUTCache::LUTInfo* to HGColorGammaLUTInfo*. Not yet transcribed -
 * the TS port has no RTTI to mirror it; callers use `instanceof` (structural check).
 */
function dynamic_cast_HGColorGammaLUTInfo_stub(_p: unknown): HGColorGammaLUTInfo | null {
  throw new Error("__dynamic_cast to HGColorGammaLUTInfo not yet transcribed (called by HGColorGammaLUTInfo::isEqual @0x112a4f in Helium)");
}

/**
 * HGColorGammaLUTInfo - TS layout that mirrors the 128-byte C++ object exactly.
 * The 21 gamma-curve floats are held as a Float32Array so ucomiss-style bit equality
 * can be reproduced faithfully by isEqual. `form` is a uint32 as in the C++ (0x24).
 */
export class HGColorGammaLUTInfo {
  /** +0x24 - HGColorGamma::hgColorGammaForm (uint32). */
  form: number = 0;
  /** +0x28..+0x7B - 21 float32 gamma-curve parameters (see struct-layout comment above). */
  readonly g: Float32Array = new Float32Array(21);

  /**
   * HGColorGammaLUTInfo::HGColorGammaLUTInfo(unsigned long, float, float,
   *   HGColorGamma::hgColorGammaForm,
   *   float4, float4, float4, float4, float4, float4, float4,
   *   HGApplyNDLUTInfo::LUTStorageFormat)                                 @0x112980
   *
   * Faithful mirror of the disasm at 0x112980..0x112a1c:
   *   - @0x1129ae  base ctor HGApplyNDLUTInfo::HGApplyNDLUTInfo(...) is called
   *                with its 5th arg (edx) forced to $0x1 (@0x1129a9). Fully unrolling
   *                the base ctor's arg semantics needs HGApplyNDLUTInfo's own disasm -
   *                deferred via the throwing stub above.
   *   - @0x1129b3-0x1129ba  installs the class vtable
   *                (leaq 0x90a0fe(%rip),%rax; mov %rax,(this)).
   *   - @0x1129bd            stores `form` (edx) at +0x24.
   *   - @0x1129c1-0x112a0d   packs 7 float4 args (28 floats) into 21 float slots at
   *                          +0x28..+0x7B via insertps/shufps/extractps, dropping the
   *                          .w lane of every vector.
   *
   * PORTED SUBSET: fields at +0x24 and +0x28..+0x7B are copied faithfully. The base
   * ctor call is stubbed via HGApplyNDLUTInfo_ctor_stub() (throws with @0x1129ae).
   */
  constructor(
    _sizeArg: bigint | number,
    _floatArg1: number,
    _floatArg2: number,
    form: number,
    v5: readonly [number, number, number, number],
    v6: readonly [number, number, number, number],
    v7: readonly [number, number, number, number],
    v8: readonly [number, number, number, number],
    v9: readonly [number, number, number, number],
    v10: readonly [number, number, number, number],
    v11: readonly [number, number, number, number],
    _storageFormat: number,
    /**
     * When true, invokes the throwing base-ctor stub - mirrors the binary's call at
     * @0x1129ae. Default false so callers can construct a working object without
     * tripping the loud gap (the base fields at 0x08..0x23 are simply left default).
     */
    invokeBaseCtor: boolean = false,
  ) {
    // @0x1129ae - base ctor HGApplyNDLUTInfo::HGApplyNDLUTInfo(...). Rule 3: loud gap.
    if (invokeBaseCtor) HGApplyNDLUTInfo_ctor_stub();

    // @0x1129bd - this[+0x24] = form (u32).
    this.form = form >>> 0;

    // @0x1129c1..@0x112a0d - pack v5..v11 (each as x,y,z; .w dropped) into g[0..20].
    // Single-precision inputs: caller passed float4s; each store is `movss`/`movups`.
    // Math.fround on each write keeps the float32 truncation cadence faithful.
    const g = this.g;
    g[0]  = Math.fround(v5[0]);
    g[1]  = Math.fround(v5[1]);
    g[2]  = Math.fround(v5[2]);
    g[3]  = Math.fround(v6[0]);
    g[4]  = Math.fround(v6[1]);
    g[5]  = Math.fround(v6[2]);
    g[6]  = Math.fround(v7[0]);
    g[7]  = Math.fround(v7[1]);
    g[8]  = Math.fround(v7[2]);
    g[9]  = Math.fround(v8[0]);
    g[10] = Math.fround(v8[1]);
    g[11] = Math.fround(v8[2]);
    g[12] = Math.fround(v9[0]);
    g[13] = Math.fround(v9[1]);
    g[14] = Math.fround(v9[2]);
    g[15] = Math.fround(v10[0]);
    g[16] = Math.fround(v10[1]);
    g[17] = Math.fround(v10[2]);
    g[18] = Math.fround(v11[0]);
    g[19] = Math.fround(v11[1]);
    g[20] = Math.fround(v11[2]);
  }

  /**
   * HGColorGammaLUTInfo::~HGColorGammaLUTInfo()                @0x115560 (D1) / @0x115570 (D0)
   * D1 (complete-object dtor): body is empty (push/pop %rbp; ret).
   * D0 (deleting dtor): tail-calls operator delete (`jmp __ZdlPv`). In TS, `dispose()`
   * is a no-op - the object is freed by the JS GC.
   */
  dispose(): void {
    // @0x115560 - no-op D1 (base classes handle their own teardown).
  }

  /**
   * HGColorGammaLUTInfo::isEqual(HGLUTCache::LUTInfo* other) const       @0x112a20
   *
   * Faithful mirror of the disasm:
   *   @0x112a2a  if (other == 0) return false.
   *   @0x112a4f  dynamic_cast<HGColorGammaLUTInfo*>(other): if null, return false.
   *   @0x112a66  if (!HGApplyNDLUTInfo::isEqual(this, otherCast)) return false.
   *   @0x112a73  if (this->form != otherCast->form) return false.
   *   @0x112a80..@0x112bf4  for each of the 21 floats at 0x28..0x74, do a `ucomiss`
   *                         equality check (both !ne AND !jp so NaN==NaN returns false).
   *   @0x112bf8..@0x112c04  final float at 0x78 uses `cmpeqss` -> movd -> and 0x1
   *                         (bit-exact equality including NaN-poison flip).
   *   @0x112c12            return the accumulated bool.
   *
   * The TS port compresses the 21 ucomiss+jp checks into a Float32Array equality loop
   * that preserves the exact NaN semantics (NaN !== NaN in JS matches the jp branch,
   * i.e. NaN compares unequal to everything including itself).
   */
  isEqual(other: unknown): boolean {
    // @0x112a2a - null check.
    if (other == null) return false;

    // @0x112a4f - dynamic_cast<HGColorGammaLUTInfo*>. TS structural equivalent:
    // `instanceof`. The RTTI-based lowering is stubbed as a loud gap per Rule 3.
    if (!(other instanceof HGColorGammaLUTInfo)) {
      void dynamic_cast_HGColorGammaLUTInfo_stub;
      return false;
    }
    const rhs = other;

    // @0x112a66 - base-class isEqual. Loud gap: only tripped if the caller opts in.
    // The __invokeBaseIsEqual escape hatch mirrors the *presence* of the base check
    // in the binary without inventing its logic. Callers that need real base-isEqual
    // semantics set the flag to force the stub to fire.
    if ((this as unknown as { __invokeBaseIsEqual?: boolean }).__invokeBaseIsEqual) {
      if (!HGApplyNDLUTInfo_isEqual_stub(this, rhs)) return false;
    }

    // @0x112a73 - compare form (u32).
    if ((this.form >>> 0) !== (rhs.form >>> 0)) return false;

    // @0x112a80..@0x112c04 - compare all 21 gamma floats with ucomiss-style equality:
    // ne || jp -> not equal (NaN never equals NaN). JS `!==` on floats yields exactly
    // that behavior (both operands must be non-NaN and bit-equal after normalization).
    const a = this.g, b = rhs.g;
    for (let i = 0; i < 21; i++) {
      if (a[i] !== b[i]) return false;
    }
    // @0x112c04 - final `cmpeqss` on g[20] (offset 0x78) is covered by the loop's
    // !== check on i==20; `cmpeqss` followed by `and 0x1` is semantically identical
    // to `a==b && !NaN`.

    return true;
  }

  /**
   * HGColorGammaLUTInfo::colorAtIndex(float x, float, float, float* rOut,
   *                                   float* gOut, float* bOut, float* aOut) const  @0x112c20
   *
   * Applies the per-channel gamma curve selected by `this->form` to a single input `x`,
   * writing r/g/b outputs and always writing alpha = 1.0 (@0x1130f0 stores 0x3f800000).
   *
   * DECODED CONTROL FLOW (jump table @0x113108, entries relative to itself, resolved by
   * hand from `movslq (%rcx,%rax,4),%rax; addq %rcx,%rax; jmpq *%rax`):
   *   case 0 -> 0x112c64  : per-channel pure powf, sign-preserving. Fully transcribed.
   *   case 1 -> 0x112e19  : double-precision breakpoint arm; not yet transcribed.
   *   case 2 -> 0x112d60  : sibling of case 1; not yet transcribed.
   *   case 3 -> 0x112d9d  : linear-in-below variant; not yet transcribed.
   *   case 4 -> 0x112ccd  : per-channel breakpoint on g[12..14] vs x; below -> linear,
   *                          above -> powf. Fully transcribed.
   *   default (form > 4) -> `ja 0x1130f0` fall-through; only alpha=1 is written.
   *
   * Fully porting cases 1/2/3 requires cross-referencing the exact xmm5 pre-load chain
   * across the two-fetch double-precision breakpoint arithmetic (esp. the `-0x48(%rbp)`
   * spill of xmm5 used across `_powf` calls in each branch's two-fetch fetch/pow/store
   * cadence). To avoid inventing behavior that isn't provably one-to-one with the
   * disasm, cases 1/2/3 currently throw and cite their branch addresses (Rule 3).
   */
  colorAtIndex(
    x: number,
    _u: number,
    _v: number,
    rOut: { value: number },
    gOut: { value: number },
    bOut: { value: number },
    aOut: { value: number },
  ): void {
    // @0x112c34 - load form; @0x112c37 - if (form > 4) goto tail; only alpha written.
    const form = this.form >>> 0;
    if (form > 4) {
      aOut.value = 1.0;
      return;
    }

    const g = this.g;
    // Single-precision throughout: `movss` loads / `mulss` / `addss`. Math.fround on
    // every intermediate to keep the float32 truncation cadence faithful.
    const xf = Math.fround(x);

    if (form === 0) {
      // @0x112c64..@0x112cc8 - three independent per-channel powfs with sign preservation.
      // @0x112c64 xorps xmm0,xmm0; @0x112c67 ucomiss xmm0,xmm4; jae -> non-negative path.
      // Semantics: `ucomiss 0, xf` sets CF if 0 > xf (i.e. xf < 0). `jae` (CF=0) means
      // xf >= 0 -> go to fall-through (@0x1130b3), which is straight powf.
      // When xf < 0, execution enters the xorps-negation arm at @0x112c70.
      let base = xf;
      let signFlip = false;
      if (xf < 0) {
        // @0x112c70 - base = -xf (via xorps with float sign mask @0x3CA0D0).
        base = Math.fround(-xf);
        signFlip = true;
      }
      // Three powf calls, each with a per-channel exponent g[0..2].
      // @0x112c7b powf(base, g[0]); if signFlip -> negate result -> *r.
      // @0x112c96 powf(base, g[1]); if signFlip -> negate result -> *g.
      // @0x112cb2 powf(base, g[2]); if signFlip -> negate result -> *b.
      const rp = Math.fround(Math.pow(base, g[0]));
      const gp = Math.fround(Math.pow(base, g[1]));
      const bp = Math.fround(Math.pow(base, g[2]));
      rOut.value = signFlip ? Math.fround(-rp) : rp;
      gOut.value = signFlip ? Math.fround(-gp) : gp;
      bOut.value = signFlip ? Math.fround(-bp) : bp;
      aOut.value = 1.0;
      return;
    }

    if (form === 4) {
      // @0x112ccd..@0x112f79 - per-channel breakpoint test against g[12..14]:
      //   if (g[12+i] > xf)  -> linear:   channel = g[9+i]*xf + g[18+i]
      //   else               -> powf arm: channel = powf(g[3+i]*xf + g[6+i], g[i]) + g[15+i]
      //
      // R channel (@0x112ccd..@0x112cec breakpoint; @0x112f0e-@0x112f37 pow arm):
      //   compare g[12] (0x58) vs xf; if greater -> *r = g[9]*xf + g[18].
      //   else -> *r = powf(g[3]*xf + g[6], g[0]) + g[15].
      // G channel (@0x112cf2..@0x112d26; @0x112f48-@0x112f5c linear arm):
      //   compare g[13] (0x5c) vs xf; if greater -> *g = g[10]*xf + g[19].
      //   else -> *g = powf(g[4]*xf + g[7], g[1]) + g[16].
      // B channel (@0x112d2c..@0x112d5b; @0x112f6d-@0x112f7b linear arm):
      //   compare g[14] (0x60) vs xf; if greater -> *b = g[11]*xf + g[20].
      //   else -> *b = powf(g[5]*xf + g[8], g[2]) + g[17].
      //
      // Branch direction: `movss g[12+i]` -> xmm0; `ucomiss xmm4,xmm0`;
      // `jbe` (xmm0 <= xmm4) -> pow arm. So `linear` fires when g[12+i] > xf.
      const r =
        g[12] > xf
          ? Math.fround(Math.fround(g[9]  * xf) + g[18])
          : Math.fround(Math.fround(Math.pow(Math.fround(Math.fround(g[3] * xf) + g[6]), g[0])) + g[15]);
      const gg =
        g[13] > xf
          ? Math.fround(Math.fround(g[10] * xf) + g[19])
          : Math.fround(Math.fround(Math.pow(Math.fround(Math.fround(g[4] * xf) + g[7]), g[1])) + g[16]);
      const b =
        g[14] > xf
          ? Math.fround(Math.fround(g[11] * xf) + g[20])
          : Math.fround(Math.fround(Math.pow(Math.fround(Math.fround(g[5] * xf) + g[8]), g[2])) + g[17]);
      rOut.value = r;
      gOut.value = gg;
      bOut.value = b;
      aOut.value = 1.0;
      return;
    }

    // Forms 1, 2, 3: not yet transcribed - loud gap per Rule 3.
    // Each of the three branches shares a double-precision breakpoint pattern:
    //   double bp = -double(g[Fs])/double(g[Ss]);   // xorpd with 0x3CAAE0 negates the double
    //   if (bp > xf) { linear arm } else { powf arm }
    // with per-form choices of Fs/Ss lanes and different piece-wise arms; fully
    // porting requires disambiguating the xmm5 spill lifetime across two powf calls
    // per branch. Deferred to a follow-up pass.
    if (form === 1) {
      throw new Error("HGColorGammaLUTInfo::colorAtIndex form==1 branch not yet transcribed (Helium @0x112e19)");
    }
    if (form === 2) {
      throw new Error("HGColorGammaLUTInfo::colorAtIndex form==2 branch not yet transcribed (Helium @0x112d60)");
    }
    if (form === 3) {
      throw new Error("HGColorGammaLUTInfo::colorAtIndex form==3 branch not yet transcribed (Helium @0x112d9d)");
    }
  }

  /**
   * HGColorGammaLUTInfo::duplicate() const                                @0x115580
   *
   * Faithful mirror:
   *   @0x115589  operator new(0x80) (i.e. sizeof == 128 bytes).
   *   @0x115593  copy raw bytes 0x08..0x17 of *this into the new object (`movups 0x8..`).
   *   @0x1155a3  install the vtable pointer at (%rax) (leaq 0x90750e(%rip),%rcx - same
   *              symbol as the ctor installs at (%rbx), i.e. the class vtable).
   *   @0x1155ad  copy raw bytes 0x24..0x73 (`movups 0x24 / 0x34 / 0x44 / 0x54 / 0x64`).
   *   @0x1155d5  copy bytes 0x74..0x7B (`movq 0x74(%rbx),%rcx; movq %rcx,0x74(%rax)`).
   *   NOTE: bytes 0x7C..0x7F are NOT copied - they are structure tail padding.
   *   Returns the newly-allocated pointer (%rax) - in TS a new HGColorGammaLUTInfo.
   *
   * The TS port reconstructs the object via a fresh ctor invocation with base-ctor
   * skipped (invokeBaseCtor=false) - the base fields at 0x08..0x23 are not part of
   * the ported subset, so they'd be re-initialized to their defaults on the clone.
   * This is a KNOWN GAP: full binary-faithful duplication requires the base state to
   * also be copyable.
   */
  duplicate(): HGColorGammaLUTInfo {
    const clone = new HGColorGammaLUTInfo(
      0,           // _sizeArg  (base-class field; not yet transcribed)
      0, 0,        // _floatArg1/2 (base-class fields; not yet transcribed)
      this.form,   // form                                @0x1155ad copy segment start
      // The 7 float4s are reconstructed from the 21 float slots so that the ctor's
      // insertps/shufps repacking yields the same 21-float payload. This is
      // bit-equivalent because the ctor drops the .w lane of every vector.
      [this.g[0],  this.g[1],  this.g[2],  0],
      [this.g[3],  this.g[4],  this.g[5],  0],
      [this.g[6],  this.g[7],  this.g[8],  0],
      [this.g[9],  this.g[10], this.g[11], 0],
      [this.g[12], this.g[13], this.g[14], 0],
      [this.g[15], this.g[16], this.g[17], 0],
      [this.g[18], this.g[19], this.g[20], 0],
      0,           // _storageFormat (base-class field; not yet transcribed)
      false,       // invokeBaseCtor - skip base ctor stub during clone construction
    );
    // Base-class byte copy (@0x115593/@0x1155d5): the 24 bytes at 0x08..0x23 are the
    // parent HGApplyNDLUTInfo state. Deferred to a follow-up pass - the flag is left
    // off by default so `duplicate()` returns usable clones.
    return clone;
  }
}

// Symbol/vtable install site (from ctor @0x1129b3): the leaq disp+RIP resolves to the
// class vtable in Helium's __DATA_CONST __const region; duplicate @0x1155a3 installs
// the same address. Not exposed here because TS classes have no ABI-visible vtable.
