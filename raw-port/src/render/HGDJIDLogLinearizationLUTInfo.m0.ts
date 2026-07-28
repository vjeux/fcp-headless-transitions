// HGDJIDLogLinearizationLUTInfo.m0.ts — chunk 0 (all 8 methods) of the DJI D-Log→Linear
// linearization LUT descriptor in Helium.framework.
//
// Subclasses HGApplyNDLUTInfo (already landed at raw-port/src/render/HGApplyNDLUTInfo.ts).
// This is a 1-D per-channel LUT: forces numDims=1 in its base ctor call. The `colorAtIndex`
// method transcribes DJI D-Log's official log/linear split into a linear scene value,
// then divides by 0.9 (Apple's convention for their linearization-LUT tables — the base
// class holds the scale/offset the LUT will be sampled through).
//
// Framework: Helium
// Method source disassemblies:
//   raw-port/re/disasm/Helium.HGDJIDLogLinearizationLUTInfo.HGDJIDLogLinearizationLUTInfo.s @0x114be0  C1 ctor
//                                                                                          @0x114be0  C2 ctor (same body per ICF)
//   raw-port/re/disasm/Helium.HGDJIDLogLinearizationLUTInfo.isEqual.s                       @0x114c10
//   raw-port/re/disasm/Helium.HGDJIDLogLinearizationLUTInfo.colorAtIndex.s                  @0x114c60
//                                                                                          @0x3c4280  colorAtIndex.cold.1 (guard-init for static `tl`)
//                                                                                          @0x3c42c0  colorAtIndex.cold.2 (guard-init for static `cc`)
//   raw-port/re/disasm/Helium.HGDJIDLogLinearizationLUTInfo.~HGDJIDLogLinearizationLUTInfo.s @0x115b70 D1 (no-op)
//                                                                                            @0x115b80 D0 (jumps into operator delete)
//   raw-port/re/disasm/Helium.HGDJIDLogLinearizationLUTInfo.duplicate.s                     @0x115b90
//
// DJI subclass vtable @Helium 0xa1cf68 (computed: 0x114bfc + 0x90836c = 0xa1cf68 in ctor;
// 0x115bba + 0x9073ae = 0xa1cf68 in duplicate — both point to same table).
//
// COLD-PATH INITIALIZED STATICS (function-scoped, guarded via __cxa_guard_acquire/release):
//   tl (double)  — log/linear branch threshold                @0x3c4294  bytes 0x3fc1e81cc48a70b5
//                                                             = 0.13989600750654110  (approx 0.14)
//   cc (double)  — multiplier inside `exp(...)`               @0x3c42d4  bytes 0x4021f1463a0b6a33
//                                                             = 8.971238912480748    ( = ln(10)/0.256663 )
//
// STATIC RIP-DATA CONSTANTS (in Helium `__TEXT.__const`, x86_64 slice at fat-offset 0x4000):
//   @0x3d4c30 f64  -0.5845540051893599  (D-Log intercept "0.584555" negated for `addsd`)
//                     — used ONLY in the log branch pre-exp:  x → (x + -0.584555)
//   @0x3d4c38 f64  -0.010800000000000001  (D-Log "0.0108" negated for addsd)
//                     — used ONLY in the log branch post-exp: y → (y + -0.0108)
//   @0x3d4c40 f64   0.9892                (D-Log "0.9892")
//                     — used ONLY in the log branch:          y → y / 0.9892
//   @0x3d4c20 f64  -0.0929                (D-Log "0.0929" negated for addsd)
//                     — used ONLY in the linear branch:       x → (x + -0.0929)
//   @0x3d4c28 f64   6.025                 (D-Log "6.025")
//                     — used ONLY in the linear branch:       y → y / 6.025
//   @0x3d0e50 f64   0.9                   (Apple's post-linearization normalizing scale)
//                     — used by BOTH branches at the tail:    y → y / 0.9
//   @0x3c7cc0 f32   1.0                   (upper clamp threshold, compared to input f32)
//   @0x3ca260 f64   1.0                   (RIP-loaded double sentinel; see branch analysis)
//
// The linear-branch inverse:   y = (x - 0.0929) / 6.025 / 0.9
// The log-branch inverse:      y = (exp((x - 0.584555) * cc) - 0.0108) / 0.9892 / 0.9
// Threshold branch:            x <= tl → linear;  x > tl → log.
// Clamps observed:             x < 0 → linear branch with x=0 (xmm0 pinned to 0.0 by xorps
//                                       and the sub-tl test is done against xmm0 not x)
//                              x > 1 → log branch with xmm0 = 1.0 (constant ceiling)

import { HGApplyNDLUTInfo, LUTStorageFormat } from "./HGApplyNDLUTInfo";

// ---------------------------------------------------------------------------
// The subclass carries no additional fields beyond HGApplyNDLUTInfo (size 0x28
// per duplicate()'s `movl $0x28,%edi` heap-alloc + `movups`x2 field-copy — the
// only writable state is the base's 5 fields plus the installed vtable).
// ---------------------------------------------------------------------------
export const kHGDJIDLogLinearizationLUTInfo_vtable = 0xa1cf68; // @Helium (ctor 0x114bf5, dup 0x115bb3)

// Static RIP constants — bit-identical to the binary (see decode block above).
const K_addLog     = -0.5845540051893599;                    // @Helium 0x3d4c30 (D-Log intercept, negated)
const K_addLogPost = -0.010800000000000001;                  // @Helium 0x3d4c38 (D-Log "0.0108", negated)
const K_divLogPost = 0.9892;                                 // @Helium 0x3d4c40 (D-Log "0.9892")
const K_addLin     = -0.0929;                                // @Helium 0x3d4c20 (D-Log "0.0929", negated)
const K_divLin     = 6.025;                                  // @Helium 0x3d4c28 (D-Log "6.025")
const K_divTail    = 0.9;                                    // @Helium 0x3d0e50 (Apple's /0.9 normalizer)
const K_upperF32   = Math.fround(1.0);                       // @Helium 0x3c7cc0 (upper clamp f32)
const K_sentinel1  = 1.0;                                    // @Helium 0x3ca260 (RIP f64 = 1.0)

// Function-scoped statics from the guard-init cold paths.
const K_tl = 0.13989600750654110;                            // @Helium cold.1 init val 0x3fc1e81cc48a70b5
const K_cc = 8.971238912480748;                              // @Helium cold.2 init val 0x4021f1463a0b6a33

// ---------------------------------------------------------------------------
// ctor  HGDJIDLogLinearizationLUTInfo(unsigned long numBins, float rangeScale,
//                                     float rangeOffset, LUTStorageFormat storage)
// @Helium 0x114be0 (C1 body — C2 is a same-address ICF alias)
// ---------------------------------------------------------------------------
// AMD64 args:  %rdi=this, %rsi=numBins, %xmm0=rangeScale, %xmm1=rangeOffset, %edx=storage
// Body (mirrored):
//   pushq %rbp ; movq %rsp, %rbp ; pushq %rbx ; pushq %rax
//   movl  %edx, %ecx                    ; rescue storage into %ecx (5th arg of base)
//   movq  %rdi, %rbx                    ; save `this`
//   movl  $0x1, %edx                    ; base ctor's 3rd int arg = numDims = 1 (forced)
//   callq HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float, LUTStorageFormat)
//                                        ; base(%rdi,%rsi=numBins,%rdx=1,%xmm0,%xmm1,%ecx=storage)
//   leaq  0x90836c(%rip), %rax          ; rax = 0xa1cf68 (DJI subclass vtable)
//   movq  %rax, (%rbx)                  ; *this = subclass vtable   (overrides base's install)
//   addq $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
//
// Effect: chain-construct HGApplyNDLUTInfo with numDims forced to 1, then install DJI vtable.
export class HGDJIDLogLinearizationLUTInfo extends HGApplyNDLUTInfo {
  constructor(
    numBins: number,
    rangeScale: number,
    rangeOffset: number,
    storage: LUTStorageFormat,
  ) {
    // @Helium 0x114beb+0x114bf0: base ctor with numDims=1 (DJI D-Log is single-channel).
    super(numBins, 1, rangeScale, rangeOffset, storage);
    // @Helium 0x114bf5..0x114bfc: install DJI subclass vtable, overwriting base's.
    this.vtable = kHGDJIDLogLinearizationLUTInfo_vtable;
  }
}

// ---------------------------------------------------------------------------
// isEqual(HGLUTCache::LUTInfo*) const  @Helium 0x114c10
// ---------------------------------------------------------------------------
// Body:
//   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
//   testq %rsi, %rsi ; je 0x114c4f       ; if (other == null) return false
//   movq  %rdi, %rbx
//   movq  __ZTIN10HGLUTCache7LUTInfoE(%rip), %rax   ; typeinfo for src type (HGLUTCache::LUTInfo)
//   leaq  __ZTI29HGDJIDLogLinearizationLUTInfo(%rip), %rdx ; typeinfo for dst type
//   movq  %rsi, %rdi
//   movq  %rax, %rsi
//   xorl  %ecx, %ecx                     ; hint = 0
//   callq ___dynamic_cast                ; dynamic_cast<HGDJIDLogLinearizationLUTInfo*>(other)
//   testq %rax, %rax ; je 0x114c4f       ; failed cast → return false
//   movq  %rbx, %rdi
//   movq  %rax, %rsi
//   ... jmp HGApplyNDLUTInfo::isEqual    ; tail-call the base's isEqual with the same-typed casted ptr
// 0x114c4f: xorl %eax, %eax ; ret        ; return false
//
// Effect: an exact dynamic-type equality — the argument must ALSO be a
// HGDJIDLogLinearizationLUTInfo (subclass, not the base HGLUTCache::LUTInfo),
// and then the base class's `isEqual` compares numBins/numDims/rangeScale/rangeOffset/
// storage with epsilon. Because DJI has no extra fields, base's isEqual is exact.
export function HGDJIDLogLinearizationLUTInfo_isEqual(
  self: HGDJIDLogLinearizationLUTInfo,
  other: unknown,
): boolean {
  if (other == null) return false;
  // Faithful `dynamic_cast<HGDJIDLogLinearizationLUTInfo*>(other)`:
  if (!(other instanceof HGDJIDLogLinearizationLUTInfo)) return false;
  // Tail-call HGApplyNDLUTInfo::isEqual(self, other) — the base method compares
  // numBins == other.numBins, numDims == other.numDims, |rangeScale-o.rangeScale|<1e-4,
  // |rangeOffset-o.rangeOffset|<1e-4, storage == o.storage.
  return (self as HGApplyNDLUTInfo).isEqual(other as HGApplyNDLUTInfo);
}

// ---------------------------------------------------------------------------
// colorAtIndex(float x, float y, float z, float* rOut, float* gOut, float* bOut, float* aOut) const
// @Helium 0x114c60  (+ cold.1@0x3c4280, cold.2@0x3c42c0 for tl/cc guard init)
// ---------------------------------------------------------------------------
// AMD64 args: %rdi=this, %xmm0=x, %xmm1=y, %xmm2=z, %rsi=rOut, %rdx=gOut, %rcx=bOut, %r8=aOut
// The port ignores `this` (the guarded statics + RIP constants are the entire state)
// and IGNORES `y` (%xmm1) and `z` (%xmm2 originally — but the code IMMEDIATELY does
// `movaps %xmm0, %xmm2` making xmm2 hold `x`, and never touches y/z after). So `y` and
// `z` are dead inputs at this IF level — the function is a per-channel scalar transform
// invoked once per index with all three output ptrs receiving the SAME value. This is
// how Helium's LUT-info classes vend a 1-D linearization curve.
//
// Body reflow (guard-checked at entry; if a guard is 0 the cold-init runs first):
//
//   [after guards initialized]
//   xorps xmm0,xmm0 ; xorps xmm1,xmm1
//   ucomiss xmm2, xmm1                    ; cmp 0.0 vs x  (AT&T src,dst; CF=1 if 0<x, ZF=1 if 0==x)
//   jbe  114d04                            ; if x >= 0, jump to positive path
//   ; --- NEGATIVE-x path (fall-through) ---
//   ucomisd tl(0.13989...), xmm0(0.0)      ; 0.0 vs 0.14  → 0<0.14 → jbe fires
//   jbe  114d1f                            ; linear-branch with xmm0=0.0
//
//   0x114d04 ucomiss 1.0(f32), xmm2(=x)   ; x vs 1.0
//   0x114d0b jbe  114d5e                  ; if x <= 1.0 → jump to double-convert path
//   ; --- x > 1.0 (upper clamp) ---
//   0x114d0d movsd 1.0(f64), xmm0         ; xmm0 = 1.0  (constant! ceiling)
//   0x114d15 ucomisd tl, xmm0             ; 1.0 vs 0.14 → 1.0 > 0.14 → ja always
//   0x114d1d ja   114ca9                  ; log branch with xmm0 = 1.0 (ceiling)
//
//   0x114d5e xorps xmm0,xmm0
//   0x114d61 cvtss2sd xmm2, xmm0          ; xmm0 = (double)x   [x in [0,1]]
//   0x114d65 ucomisd tl, xmm0             ; x vs 0.14
//   0x114d6d ja   114ca9                  ; if x > tl → log branch
//   0x114d73 jmp  114d1f                  ; else       → linear branch
//
//   ; --- LOG BRANCH @0x114ca9 ---  (xmm0 is either (double)x, or 1.0 for x>1 clamp)
//   0x114ca9 addsd  -0.584555, xmm0       ; xmm0 = xmm0 - 0.584555
//   0x114cb1 mulsd  cc(=8.9712...), xmm0  ; xmm0 *= cc
//   0x114cb9 callq  _exp                   ; xmm0 = exp(xmm0)
//   0x114cbe addsd  -0.0108, xmm0          ; xmm0 -= 0.0108
//   0x114cc6 divsd  0.9892, xmm0           ; xmm0 /= 0.9892
//   0x114cce jmp    114d2f                 ; → tail /= 0.9
//
//   ; --- LINEAR BRANCH @0x114d1f --- (xmm0 = 0.0 for x<0; xmm0 = (double)x for 0<=x<=tl)
//   0x114d1f addsd  -0.0929, xmm0         ; xmm0 -= 0.0929
//   0x114d27 divsd   6.025, xmm0          ; xmm0 /= 6.025
//   ; fall-through to 0x114d2f
//
//   ; --- COMMON TAIL @0x114d2f ---
//   0x114d2f divsd   0.9, xmm0            ; xmm0 /= 0.9
//   0x114d37 cvtsd2ss xmm0, xmm0          ; xmm0 = (float)xmm0
//   0x114d3b movss %xmm0, (%r12=rOut)     ; *rOut  = result
//   0x114d41 movss %xmm0, (%r15=gOut)     ; *gOut  = result
//   0x114d46 movss %xmm0, (%r14=bOut)     ; *bOut  = result
//   0x114d4b movl $0x3f800000, (%rbx=aOut); *aOut  = 1.0f
//   ret
//
// Note: the "negative-x" path re-uses xmm0 which was cleared to 0.0. So the compare
// against tl in that branch is `0.0 vs 0.14` (constant comparison — always jbe).
// The subsequent linear-branch code STARTS from xmm0=0.0, meaning the negative-x
// result is (0.0 - 0.0929)/6.025/0.9 = -0.01715... , a FIXED floor value regardless
// of how negative x actually was. This is the binary's real behavior — port faithfully.
export function HGDJIDLogLinearizationLUTInfo_colorAtIndex(
  _self: HGDJIDLogLinearizationLUTInfo,
  x: number,
  _y: number,
  _z: number,
  rOut: { value: number },
  gOut: { value: number },
  bOut: { value: number },
  aOut: { value: number },
): void {
  // The three input floats are seen as single-precision at the ABI boundary; the code
  // moves x into a working xmm and immediately promotes to double via cvtss2sd for the
  // [0,1] branch. Mirror that with Math.fround at the input edge.
  const xf = Math.fround(x);

  // The exact same clamp/pin behavior the asm exhibits — express it as a computed
  // "effective double input" `xd` fed into the log/linear branches.
  let branchLog: boolean;  // true → log branch; false → linear branch
  let xd: number;          // the double the arithmetic reads from

  if (!(xf >= 0)) {
    // NEGATIVE-x path (@0x114c9d fall-through): xmm0 was zeroed then
    // compared to tl (unrelated to x). The linear branch runs on xmm0 = 0.0.
    branchLog = false;
    xd = 0.0;
  } else if (xf > K_upperF32) {
    // UPPER-CLAMP path (@0x114d0b false → 0x114d0d): xmm0 loaded with the f64 1.0
    // constant, then the log branch runs with xmm0 = 1.0.
    branchLog = true;
    xd = K_sentinel1; // 1.0 f64
  } else {
    // 0 <= x <= 1 path (@0x114d5e): xmm0 = (double)x, compare to tl.
    xd = xf; // TS numbers are already f64; the cvtss2sd is a bit-exact widening of the fround'd xf.
    branchLog = xd > K_tl;
  }

  let y: number;
  if (branchLog) {
    // @0x114ca9..0x114cce
    y = xd + K_addLog;      // - 0.584555
    y = y  * K_cc;          // * 8.9712
    y = Math.exp(y);        // exp(...)
    y = y + K_addLogPost;   // - 0.0108
    y = y / K_divLogPost;   // / 0.9892
  } else {
    // @0x114d1f..0x114d2d
    y = xd + K_addLin;      // - 0.0929
    y = y  / K_divLin;      // / 6.025
  }
  // @0x114d2f common tail
  y = y / K_divTail;        // / 0.9

  // @0x114d37: cvtsd2ss → single-precision output
  const yf = Math.fround(y);
  rOut.value = yf;
  gOut.value = yf;
  bOut.value = yf;
  // @0x114d4b: alpha = 1.0f  (bit pattern 0x3f800000)
  aOut.value = Math.fround(1.0);
}

// ---------------------------------------------------------------------------
// ~HGDJIDLogLinearizationLUTInfo()  D1 @Helium 0x115b70   (vt+0x00, base-dtor)
// ~HGDJIDLogLinearizationLUTInfo()  D0 @Helium 0x115b80   (vt+0x08, deleting-dtor)
// ---------------------------------------------------------------------------
// D1 body:  push %rbp ; mov %rsp,%rbp ; pop %rbp ; ret
//   → completely empty destructor (no field cleanup — DJI has no extra state).
// D0 body:  push %rbp ; mov %rsp,%rbp ; pop %rbp ; jmp __ZdlPv (operator delete)
//   → tail-call operator delete(this) with no field cleanup.
// Neither body reinstalls the base vtable (unlike HGDJIDLogLinearization's
// SIBLING classes which do — DJI's absence here matches the compiler having
// determined subclass has no destructor-observable state).
export function HGDJIDLogLinearizationLUTInfo_dtor_D1(_self: HGDJIDLogLinearizationLUTInfo): void {
  // @Helium 0x115b70: no-op body (no destructor side effects).
}
export function HGDJIDLogLinearizationLUTInfo_dtor_D0(_self: HGDJIDLogLinearizationLUTInfo): void {
  // @Helium 0x115b80: `jmp __ZdlPv` (operator delete). In TS, the caller drops the
  // reference and the GC handles reclamation — mirror the no-observable-cleanup shape.
}

// ---------------------------------------------------------------------------
// duplicate() const  @Helium 0x115b90
// ---------------------------------------------------------------------------
// Body:
//   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
//   movq  %rdi, %rbx
//   movl  $0x28, %edi                     ; sizeof = 40 bytes
//   callq __Znwm                          ; operator new(40) → %rax
//   movups 0x8(%rbx), %xmm0               ; copy bytes [0x08..0x18) (numBins + numDims lo half)
//   movups 0x14(%rbx), %xmm1              ; copy bytes [0x14..0x24) (rangeScale/Offset/storage)
//   movups %xmm0, 0x8(%rax)
//   movups %xmm1, 0x14(%rax)              ; the two 16B copies overlap on [0x14..0x18);
//                                          ; net effect = full copy of [0x08..0x24) (all 28
//                                          ; bytes of base fields following the vtable slot).
//   leaq  0x9073ae(%rip), %rcx            ; rcx = 0xa1cf68 (DJI subclass vtable)
//   movq  %rcx, (%rax)                    ; *newObj = DJI vtable
//   addq $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
//
// Effect: heap-allocate a fresh HGDJIDLogLinearizationLUTInfo, memcpy the five base
// fields (numBins, numDims, rangeScale, rangeOffset, storage) from `this`, install
// DJI vtable, return the new pointer. Note: this BYPASSES the DJI ctor's numDims-force-to-1
// step — which is safe because `this.numDims` is already 1 (the DJI ctor set it).
export function HGDJIDLogLinearizationLUTInfo_duplicate(
  self: HGDJIDLogLinearizationLUTInfo,
): HGDJIDLogLinearizationLUTInfo {
  // Faithful port: construct a fresh object with the SAME 5 base fields.
  // (The DJI ctor forces numDims=1; since self.numDims is already 1, this is idempotent.)
  const copy = new HGDJIDLogLinearizationLUTInfo(
    self.numBins,
    self.rangeScale,
    self.rangeOffset,
    self.storage,
  );
  // The asm doesn't invoke the ctor — it memcpy's fields raw. To match bit-exact,
  // overwrite any field the DJI ctor might have coerced differently:
  copy.numBins = self.numBins;
  copy.numDims = self.numDims;         // (0x115ba3 movups covered numDims's bytes)
  copy.rangeScale = self.rangeScale;   // (0x115ba7 movups covered rangeScale)
  copy.rangeOffset = self.rangeOffset;
  copy.storage = self.storage;
  copy.vtable = kHGDJIDLogLinearizationLUTInfo_vtable;
  return copy;
}

// ---------------------------------------------------------------------------
// Dispatch table (assemble_class.py convention: <Class>_m<k>_methods).
// ---------------------------------------------------------------------------
export const HGDJIDLogLinearizationLUTInfo_m0_methods = {
  // C1 and C2 map to the class constructor (same body per ICF).
  ctor:         (numBins: number, rangeScale: number, rangeOffset: number, storage: LUTStorageFormat) =>
                  new HGDJIDLogLinearizationLUTInfo(numBins, rangeScale, rangeOffset, storage),
  isEqual:      HGDJIDLogLinearizationLUTInfo_isEqual,
  colorAtIndex: HGDJIDLogLinearizationLUTInfo_colorAtIndex,
  dtor_D0:      HGDJIDLogLinearizationLUTInfo_dtor_D0,
  dtor_D1:      HGDJIDLogLinearizationLUTInfo_dtor_D1,
  duplicate:    HGDJIDLogLinearizationLUTInfo_duplicate,
};
