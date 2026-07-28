// HGExposure.ts — FCP Helium framework class.
//
// A per-channel exposure-stop adjustment: RGB gains are stored as EV-space (stops) inputs and
// applied via `exp2f` (i.e. gain = 2^stops), then the diagonal (R,G,B,1) color-matrix multiplies
// each output channel by the corresponding gain.
//
// Faithful transcription of the x86_64 disassembly of Helium in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// See raw-port/re/disasm/Helium.HGExposure.*.s .
//
// SYMBOLS (from nm | c++filt on the Helium binary):
//   0x1a8e40  T HGExposure::HGExposure()                                     (C2)
//   0x1a8ed0  T HGExposure::HGExposure()                                     (C1)
//   0x1a8f60  T HGExposure::~HGExposure()                                    (D2)
//   0x1a8fa0  T HGExposure::~HGExposure()                                    (D1)
//   0x1a8fe0  T HGExposure::~HGExposure()                                    (D0)
//   0x1a9030  T HGExposure::SetParameter(int, float, float, float, float)
//   0x1a90e0  T HGExposure::GetOutput(HGRenderer*)
//
// CLASS HIERARCHY: extends HGColorMatrix (base ctor called by C1/C2, base dtor by D0/D1/D2).
//
// Vtable installed by ctor C1 @0x1a8edf (leaq 0x87ca62(%rip)); RIP-after = 0x1a8ee6;
//   target = 0x1a8ee6 + 0x87ca62 = 0xa25948 — the vtable-for-HGExposure.
// Also installed by C2 @0x1a8e4f (leaq 0x87caf2 -> RIP-after 0x1a8e56; target = 0x1a8e56 + 0x87caf2 = 0xa25948).
// D1 @0x1a8fa6 (leaq 0x87c99b -> 0x1a8fad; 0x1a8fad + 0x87c99b = 0xa25948).
// D2 @0x1a8f66 (leaq 0x87c9db -> 0x1a8f6d; 0x1a8f6d + 0x87c9db = 0xa25948).
// D0 @0x1a8fe9 (leaq 0x87c958 -> 0x1a8ff0; 0x1a8ff0 + 0x87c958 = 0xa25948).
//
// FIELD LAYOUT (extends HGColorMatrix; HGColorMatrix base +0x00..+0x1ef opaque):
//   +0x00  vtable pointer                            — installed by C1/C2/D0/D1/D2
//   +0x1f0 HgcExposure* child                        — set to NULL by C1/C2 (@0x1a8ee9),
//                                                       lazily allocated by GetOutput @0x1a913a;
//                                                       released via child->vtable[*0x18](child)
//                                                       when overwritten (@0x1a918b) or in dtors.
//   +0x200 float4 gain                               — [gR, gG, gB, alpha=1.0]. Initialized to
//                                                       [1,1,1,1] by C1/C2 if not already there
//                                                       (@0x1a8ef4..0x1a8f11 / 0x1a8e64..0x1a8e81).
//                                                       Rewritten by SetParameter @0x1a90b7 with
//                                                       [exp2(v0), exp2(v1), exp2(v2), 1.0].
//   +0x208 float32 (part of the +0x200 float4)       — read separately by GetOutput @0x1a911e/0x1a91c2
//                                                       to compare gain[2] to 1.0.
//
// DECODE: RIP-relative constants
//   0x3c7c40   packed 4xfloat32 = [1.0, 1.0, 1.0, 1.0]     — the identity gain float4.
//                Referenced by C1 @0x1a8efb (cmpneqps) & @0x1a8f0a (movaps),
//                C2 @0x1a8e6b (cmpneqps) & @0x1a8e7a (movaps).
//   0x3c7cc0   packed 4xfloat32 = [1.0, 6.0, 0.5, -0.5]     — alpha-lane fill 1.0 read via
//                `insertps $0x30, mem, %xmm` (which pulls mem[0] = 1.0 into lane 3).
//                Referenced by SetParameter @0x1a9088 (insertps $0x30) and @0x1a90ad,
//                and by GetOutput @0x1a9104 / 0x1a9113 / 0x1a9126 (ucomiss against 1.0).
//   Both addresses point into Helium's __DATA_CONST section; the byte values were read directly
//   from /tmp/Helium.x86_64 by this port session (verified as `0000803f x4` and
//   `0000803f 0000c040 0000003f 000000bf` respectively).
//
// FRONTIER CALLEES (throw-stubbed for calls that require external symbols):
//   HGColorMatrix::HGColorMatrix()                  @Helium (called @0x1a8eda in C1 / @0x1a8e4a in C2)
//   HGColorMatrix::~HGColorMatrix()                 @Helium (called @0x1a8f46 in C1 unwind /
//                                                             @0x1a8fd1 D1 / @0x1a8f91 D2 / @0x1a9008 D0)
//   HGColorMatrix::Scale(float, float, float)       @Helium (called @0x1a8f24 in C1 /
//                                                             @0x1a8e94 in C2 / @0x1a91ff in GetOutput)
//   HGColorMatrix::LoadIdentity()                   @Helium (called @0x1a91e0 in GetOutput)
//   HGRenderer::GetInput(HGNode*, int)              @Helium (called @0x1a90f5 in GetOutput)
//   HGObject::operator new(unsigned long)           @Helium (called @0x1a913a in GetOutput)
//   HGObject::operator delete(void*)                @Helium (called @0x1a9016 in D0 / @0x1a9230 unwind)
//   HgcExposure::HgcExposure()                      @Helium (called @0x1a9152 in GetOutput)
//   ___bzero                                        @Helium (stub 0x3c4fca, called @0x1a914a)
//   _exp2f                                          @Helium (stub 0x3c50f6, called 3x by SetParameter)
//   __Unwind_Resume                                 @Helium (stub 0x3c4e02)

/**
 * Vtable-installed pointer address for HGExposure.
 * From ctor C1 @Helium 0x1a8edf (`leaq 0x87ca62(%rip), %rax`); RIP-after = 0x1a8ee6;
 *   target = 0x1a8ee6 + 0x87ca62 = 0xa25948.
 * (C2 @0x1a8e4f, D0 @0x1a8fe9, D1 @0x1a8fa6, D2 @0x1a8f66 all resolve to the same 0xa25948.)
 */
export const HGExposure_VTABLE_INSTALLED_PTR = 0xa25948 as const;

/**
 * Identity gain float4 constant read from Helium __DATA_CONST @0x3c7c40 (verified bytes:
 * `00 00 80 3f  00 00 80 3f  00 00 80 3f  00 00 80 3f`). All four lanes are +1.0f.
 */
export const HGExposure_IDENTITY_GAIN: readonly [number, number, number, number] = [
  1.0, 1.0, 1.0, 1.0,
] as const;

/**
 * Alpha-lane fill value (+1.0f) read from Helium __DATA_CONST @0x3c7cc0 lane 0 (bytes
 * `00 00 80 3f`). SetParameter uses `insertps $0x30, mem, %xmm` to inject this into the
 * alpha lane of the new gain float4.
 */
export const HGExposure_ALPHA_ONE = 1.0 as const;

/**
 * The HGExposure instance state.
 * HGColorMatrix base subobject is opaque here.
 */
export interface HGExposureState {
  /** HGColorMatrix base placeholder (+0x00..+0x1ef). */
  _hgColorMatrix: unknown;
  /**
   * +0x1f0  HgcExposure* child — lazily allocated by GetOutput on first non-identity gain.
   * NULL by default (set to 0 by C1/C2 @0x1a8ee9 / @0x1a8e59). When overwritten by GetOutput
   * @0x1a9191, the old child is released via `child->vtable[*0x18](child)` @0x1a918b.
   */
  child: unknown | null;
  /**
   * +0x200 float4 gain — [gR, gG, gB, alpha=1.0].
   * Initialized to HGExposure_IDENTITY_GAIN by C1/C2 (only if the current bytes differ, per
   * the `cmpneqps ; movmskps ; testl ; je` gate at ctor @0x1a8ef4..0x1a8f08).
   * Rewritten by SetParameter @0x1a90b7 (only if the new float4 differs from the current one).
   */
  gain: Float32Array;
}

// ============================================================================
// C1 / C2 — constructor
// ============================================================================

/**
 * `HGExposure::HGExposure()` @Helium 0x1a8e40 (C2) / 0x1a8ed0 (C1).
 *
 * Both variants have byte-identical decoded logic (C1 delegates via a slightly different vtable
 * install offset resolving to the SAME 0xa25948 vtable).
 *
 * Verbatim disasm (C1 form @0x1a8ed0):
 *   0x1a8ed0  pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx
 *   0x1a8ed7  movq  %rdi, %rbx                                             ## rbx = this
 *   0x1a8eda  callq HGColorMatrix::HGColorMatrix()                         ## base ctor
 *   0x1a8edf  leaq  0x87ca62(%rip), %rax                                   ## vtable = 0xa25948
 *   0x1a8ee6  movq  %rax, (%rbx)                                           ## *this = vtable
 *   0x1a8ee9  movq  $0x0, 0x1f0(%rbx)                                      ## this->child = NULL
 *   0x1a8ef4  movaps 0x200(%rbx), %xmm0                                    ## xmm0 = this->gain
 *   0x1a8efb  cmpneqps 0x21ed3d(%rip), %xmm0                               ## xmm0 = (gain != [1,1,1,1])
 *   0x1a8f03  movmskps %xmm0, %eax                                         ## eax = neq mask (4 bits)
 *   0x1a8f06  testl %eax, %eax
 *   0x1a8f08  je 0x1a8f18                                                  ## if all lanes eq: skip
 *   0x1a8f0a  movaps 0x21ed2f(%rip), %xmm0                                 ## xmm0 = [1,1,1,1]
 *   0x1a8f11  movaps %xmm0, 0x200(%rbx)                                    ## this->gain = [1,1,1,1]
 *   0x1a8f18  xorps %xmm0,%xmm0; xorps %xmm1,%xmm1; xorps %xmm2,%xmm2      ## Scale(0.0, 0.0, 0.0)
 *   0x1a8f21  movq  %rbx, %rdi
 *   0x1a8f24  callq HGColorMatrix::Scale(float, float, float)              ## base method
 *   epilogue
 *
 * Note: the ctor calls `HGColorMatrix::Scale(0, 0, 0)` (three float zeros). This is Apple's
 * pattern to zero the entire color-matrix — Scale(0,0,0) collapses the diagonal to a zero row
 * for each channel; the row is later rewritten by GetOutput via LoadIdentity + Scale(gains).
 */
export function HGExposure_construct(self: HGExposureState): void {
  // @Helium 0x1a8eda: HGColorMatrix::HGColorMatrix().
  HGColorMatrix_HGColorMatrix_stub();
  // @Helium 0x1a8ee6: install vtable ptr (no-op in our model).
  // @Helium 0x1a8ee9: child = NULL.
  self.child = null;
  // @Helium 0x1a8ef4..0x1a8f11: if gain != [1,1,1,1], overwrite gain with [1,1,1,1].
  // The `cmpneqps + movmskps + je` is the fast-path optimization; in TS we can just always
  // write, but we transcribe the condition faithfully.
  let allOne = true;
  for (let lane = 0; lane < 4; ++lane) {
    if (Math.fround(self.gain[lane]) !== HGExposure_IDENTITY_GAIN[lane]) {
      allOne = false;
      break;
    }
  }
  if (!allOne) {
    for (let lane = 0; lane < 4; ++lane) {
      self.gain[lane] = Math.fround(HGExposure_IDENTITY_GAIN[lane]);
    }
  }
  // @Helium 0x1a8f24: HGColorMatrix::Scale(this, 0.0, 0.0, 0.0). Zero-out diagonal.
  HGColorMatrix_Scale_stub(self, 0.0, 0.0, 0.0);
}

// ============================================================================
// D0 / D1 / D2 — destructor
// ============================================================================

/**
 * `HGExposure::~HGExposure()` @Helium 0x1a8f60 (D2) / 0x1a8fa0 (D1).
 *
 * D1 @0x1a8fa0 and D2 @0x1a8f60 have byte-identical decoded logic (only the RIP offset for the
 * vtable-reset leaq differs by 0x40, both resolving to 0xa25948):
 *   0x1a8fa6  leaq  0x87c99b(%rip), %rax; movq %rax, (%rdi)                ## reset vtable @ 0xa25948
 *   0x1a8fb0  movq  0x1f0(%rdi), %rax                                       ## rax = this->child
 *   0x1a8fb7  testq %rax, %rax; je 0x1a8fcb                                 ## if child == NULL: skip
 *   0x1a8fbc  movq  (%rax), %rcx                                            ## rcx = child->vtable
 *   0x1a8fc2  movq  %rax, %rdi                                              ## rdi = child
 *   0x1a8fc5  callq *0x18(%rcx)                                             ## child->vtable[*0x18](child)
 *   epilogue -> tail-jmp HGColorMatrix::~HGColorMatrix()
 */
export function HGExposure_destruct(self: HGExposureState): void {
  // @Helium 0x1a8fad / 0x1a8f6d: reset vtable ptr (no-op).
  // @Helium 0x1a8fb0..0x1a8fc5: if child != NULL, invoke child->vtable[*0x18](child).
  if (self.child !== null) {
    // The vtable slot *0x18 is undecoded — likely `release()` or the deleting dtor.
    HGExposure_release_child_stub(self.child);
    self.child = null;
  }
  // @Helium 0x1a8fd1 / 0x1a8f91: tail-jmp HGColorMatrix::~HGColorMatrix().
  HGColorMatrix_dtor_stub();
}

/**
 * `HGExposure::~HGExposure()` @Helium 0x1a8fe0 — the deleting dtor (D0).
 *
 * Verbatim disasm:
 *   0x1a8fe0  pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
 *   0x1a8fe6  movq  %rdi, %rbx                                             ## rbx = this
 *   0x1a8fe9  leaq  0x87c958(%rip), %rax; movq %rax, (%rdi)                ## vtable reset -> 0xa25948
 *   0x1a8ff3  movq  0x1f0(%rdi), %rdi                                       ## rdi = this->child
 *   0x1a8ffa  testq %rdi, %rdi; je 0x1a9005                                 ## if child == NULL: skip
 *   0x1a8fff  movq  (%rdi), %rax
 *   0x1a9002  callq *0x18(%rax)                                             ## child->vtable[*0x18](child)
 *   0x1a9005  movq  %rbx, %rdi
 *   0x1a9008  callq HGColorMatrix::~HGColorMatrix()
 *   0x1a900d  movq  %rbx, %rdi
 *   0x1a9016  jmp   HGObject::operator delete(void*)
 */
export function HGExposure_deletingDtor(self: HGExposureState): void {
  HGExposure_destruct(self);
  // @Helium 0x1a9016: HGObject::operator delete(this).
  HGObject_operator_delete_stub();
}

// ============================================================================
// SetParameter — the pure-math method (exp2 the three EV inputs)
// ============================================================================

/**
 * `HGExposure::SetParameter(int paramID, float v0, float v1, float v2, float v3)` @Helium 0x1a9030.
 *
 * Return value:
 *   -1  if paramID != 0                          (@0x1a9030..0x1a9039)
 *    0  if paramID == 0 AND the computed gain float4 equals the current +0x200
 *    1  if paramID == 0 AND the gain differs (a write occurred @0x1a90b7)
 *
 * paramID == 0 body (@0x1a903a..0x1a90c9):
 *   1. Save v1 to stack (@0x1a904b) and v2 to stack (@0x1a9046).                (v3 is ignored.)
 *   2. Call exp2f(v0)  -> xmm0. Spill to -0x30(%rbp).                            (@0x1a9050)
 *   3. Reload v1 into xmm0. Call exp2f(v1) -> xmm0. Spill to -0x20(%rbp).        (@0x1a905e)
 *   4. Reload v2 into xmm0. Call exp2f(v2) -> xmm0.                              (@0x1a906c)
 *   5. Reload spills: xmm3 = exp2(v1), xmm2 = exp2(v0), xmm0 still = exp2(v2).
 *   6. Build float4 in xmm1:
 *        xmm1 = xmm2                                                             (@0x1a9079)
 *        insertps $0x10, xmm3, xmm1  -> xmm1 = [xmm2[0], xmm3[0], xmm1[2], xmm1[3]]
 *                                             = [exp2(v0), exp2(v1), _, _]      (@0x1a907c)
 *        insertps $0x20, xmm0, xmm1  -> xmm1[2] = xmm0[0] = exp2(v2)             (@0x1a9082)
 *        insertps $0x30, mem[0x3c7cc0][0]=1.0, xmm1 -> xmm1[3] = 1.0             (@0x1a9088)
 *      Result: xmm1 = [exp2(v0), exp2(v1), exp2(v2), 1.0].
 *   7. cmpneqps 0x200(%rbx), %xmm1                                               (@0x1a9092)
 *      -> xmm1[i] = (xmm1[i] != this->gain[i]) ? 0xffffffff : 0
 *      movmskps %xmm1, %eax
 *      testl %eax, %eax; je return-0                                             (@0x1a909d..0x1a90c9)
 *   8. Same-lane rebuild in xmm2 (compilers occasionally re-materialize instead of moving)
 *      then movaps %xmm2, 0x200(%rbx)                                            (@0x1a90b7)
 *   9. return 1                                                                  (@0x1a90be)
 *
 * We faithfully port both branches (paramID != 0 -> -1; equal -> 0; different -> 1).
 */
export function HGExposure_SetParameter(
  self: HGExposureState,
  paramID: number,
  v0: number,
  v1: number,
  v2: number,
  _v3: number,
): number {
  // @Helium 0x1a9030..0x1a9039: return -1 if paramID != 0.
  if ((paramID | 0) !== 0) {
    return -1 | 0;
  }
  // @Helium 0x1a9050 / 0x1a905e / 0x1a906c: three separate _exp2f calls (single-precision).
  const g0 = Math.fround(Math.pow(2, Math.fround(v0)));
  const g1 = Math.fround(Math.pow(2, Math.fround(v1)));
  const g2 = Math.fround(Math.pow(2, Math.fround(v2)));
  // @Helium 0x1a9088: insertps $0x30 with mem@0x3c7cc0[0] = HGExposure_ALPHA_ONE.
  const g3 = Math.fround(HGExposure_ALPHA_ONE);
  // @Helium 0x1a9092..0x1a909f: cmpneqps against current gain; if all equal, return 0.
  const cur0 = Math.fround(self.gain[0]);
  const cur1 = Math.fround(self.gain[1]);
  const cur2 = Math.fround(self.gain[2]);
  const cur3 = Math.fround(self.gain[3]);
  const anyDiff = g0 !== cur0 || g1 !== cur1 || g2 !== cur2 || g3 !== cur3;
  if (!anyDiff) {
    // @Helium 0x1a90ca: xorl %eax, %eax -> return 0.
    return 0 | 0;
  }
  // @Helium 0x1a90b7: movaps %xmm2, 0x200(%rbx) — commit the new float4.
  self.gain[0] = g0;
  self.gain[1] = g1;
  self.gain[2] = g2;
  self.gain[3] = g3;
  // @Helium 0x1a90be: return 1.
  return 1 | 0;
}

// ============================================================================
// GetOutput — the heavy dispatch method (lazily materializes the HgcExposure child)
// ============================================================================

/**
 * `HGExposure::GetOutput(HGRenderer*)` @Helium 0x1a90e0.
 *
 * Verbatim algorithm (from the 260-byte disasm walk):
 *
 * 1. input = HGRenderer::GetInput(renderer, this, 0)                              (@0x1a90f5)
 *      -> r15 = input node handle
 *
 * 2. FAST PATH: if gain == [1,1,1,1] AND gain[2] == 1 (redundant with lane 2 of gain check),
 *    skip the whole rebuild and return this->child directly.
 *    Verbatim gate @0x1a90fd..0x1a912f:
 *      xmm0 = this->gain                                                          (@0x1a90fd)
 *      ucomiss xmm0, [0x3c7cc0][0]=1.0f;  jne/jp -> rebuild                       (@0x1a9104..0x1a910b)
 *      xmm0 = shuffle [gain[1], gain[1], gain[3], gain[3]]                        (@0x1a910f)  ## movshdup
 *      ucomiss xmm0, 1.0f; jne/jp -> rebuild                                       (@0x1a9113..0x1a911a)
 *      xmm0 = this->+0x208 (float32 = gain[2])                                     (@0x1a911e)
 *      ucomiss xmm0, 1.0f; jne/jp -> rebuild; jnp -> FAST-PATH TAKE                (@0x1a9126..0x1a912f)
 *    On FAST PATH: return r15 = this->child directly (@0x1a9214).
 *    Note: r15 was set by GetInput @0x1a90fa; the register survives across the ucomiss chain
 *    (the disasm never overwrites it before the fast-path jmp).  Wait — the return at
 *    @0x1a9214 is `movq %r15, %rax`, but r15 at this point is the GetInput result... See NOTE.
 *
 * NOTE ON RETURN: The disasm at @0x1a9204 does `movq 0x1f0(%rbx), %r15` (r15 = this->child)
 * only in the SLOW path (immediately before the return). In the FAST path (@0x1a912f jnp to
 * 0x1a9214), r15 is still the value from `HGRenderer::GetInput` @0x1a90f5. So HGExposure
 * returns the INPUT node when the gain is identity — a semantic-noop pass-through. This is
 * the classic "no-op filter" optimization. Faithfully ported here.
 *
 * 3. SLOW PATH: build/refresh the child HgcExposure and configure it.
 *    a. Allocate 0x220 bytes via HGObject::operator new(0x220)  ->  r14           (@0x1a913a)
 *    b. bzero(r14, 0x220)                                                          (@0x1a914a)
 *    c. HgcExposure::HgcExposure()  (placement-new / ctor)                         (@0x1a9152)
 *    d. r14->vtable = 0xa25948 + 0x87ca52 offset = ... — reload after ctor as vtable + delta.
 *       (Actually @0x1a9157: `leaq 0x87ca52(%rip), %rax` RIP-after=0x1a915e; target = 0x1a915e +
 *        0x87ca52 = 0xa259b0. This is a DIFFERENT vtable (HgcExposure's own, not HGExposure's).)
 *    e. Zero r14->+0x200 (as 16 bytes / xmmword) and r14->+0x210 (as 8 bytes).      (@0x1a9161..0x1a916c)
 *    f. If this->child != NULL AND this->child != r14: release old child.           (@0x1a9177..0x1a918e)
 *       Via `old->vtable[*0x18](old)`.
 *    g. this->child = r14                                                           (@0x1a9191)
 *    h. r14->vtable[*0x10](r14)                                                      (@0x1a919b)
 *    i. new_child = this->child; new_child->vtable[*0x78](new_child, 0, input)      (@0x1a91ad)
 *       — install `input` (from GetInput @step 1) as source-0 of the child.
 *    j. Prepare gain broadcast: xmm0 = gain, xmm1 = shuffle-hi (gain[1..1..3..3]),
 *       xmm2 = gain[2], xmm3 = shuffle [3,3,3,3] (alpha broadcast).                  (@0x1a91b7..0x1a91cd)
 *       Then call new_child->vtable[*0x60](new_child, 0)                              (@0x1a91d6)
 *       — passes the four registers to the child's parameter-set method.
 *    k. new_child = this->child; HGColorMatrix::LoadIdentity(new_child).             (@0x1a91e0)
 *    l. new_child = this->child;
 *       xmm0 = gain[0], xmm1 = shuffle-hi = gain[1], xmm2 = gain[2];
 *       HGColorMatrix::Scale(new_child, gain[0], gain[1], gain[2]).                   (@0x1a91ff)
 *    m. r15 = this->child; r14->vtable[*0x18](r14)  — release the LOCAL new-child ref (@0x1a920b)
 *    n. return r15  = this->child                                                     (@0x1a9214)
 *
 * Every step in the SLOW path except the numeric gain broadcast is a vtable call or a call
 * into an undecoded external. We faithfully surface those as throwing stubs.
 */
export function HGExposure_GetOutput(_self: HGExposureState, _renderer: unknown): unknown {
  // @Helium 0x1a90e0
  throw new Error(
    "HGExposure::GetOutput not yet transcribed @Helium 0x1a90e0 — depends on undecoded " +
      "HGRenderer::GetInput @Helium 0x1a90f5, HGObject::operator new @Helium 0x1a913a, " +
      "HgcExposure::HgcExposure @Helium 0x1a9152, HGColorMatrix::LoadIdentity @Helium 0x1a91e0, " +
      "HGColorMatrix::Scale @Helium 0x1a91ff, child vtable slots *0x10 @Helium 0x1a919b, " +
      "*0x18 @Helium 0x1a920b, *0x60 @Helium 0x1a91d6, *0x78 @Helium 0x1a91ad, and ___bzero " +
      "@Helium stub 0x3c4fca @0x1a914a. Fast-path (gain == [1,1,1,1]) returns the input node " +
      "directly (@Helium 0x1a9214); slow path allocates & configures a fresh HgcExposure child.",
  );
}

// ============================================================================
// FRONTIER CALLEE STUBS
// ============================================================================

function HGColorMatrix_HGColorMatrix_stub(): void {
  // Called from HGExposure C1 @Helium 0x1a8eda and C2 @Helium 0x1a8e4a.
  throw new Error("HGColorMatrix::HGColorMatrix() @Helium 0x1a8eda not yet transcribed");
}

function HGColorMatrix_dtor_stub(): void {
  // Called from HGExposure D1 @Helium 0x1a8fd1, D2 @Helium 0x1a8f91, D0 @Helium 0x1a9008.
  throw new Error("HGColorMatrix::~HGColorMatrix() @Helium 0x1a8fd1 not yet transcribed");
}

function HGColorMatrix_Scale_stub(
  _self: HGExposureState,
  _r: number,
  _g: number,
  _b: number,
): void {
  // Called from HGExposure C1 @Helium 0x1a8f24 / C2 @Helium 0x1a8e94 / GetOutput @Helium 0x1a91ff.
  throw new Error("HGColorMatrix::Scale(float,float,float) @Helium 0x1a8f24 not yet transcribed");
}

function HGObject_operator_delete_stub(): void {
  // Called from HGExposure D0 @Helium 0x1a9016.
  throw new Error("HGObject::operator delete(void*) @Helium 0x1a9016 not yet transcribed");
}

function HGExposure_release_child_stub(_child: unknown): void {
  // Called from HGExposure D0/D1/D2 via `child->vtable[*0x18](child)`
  // (D0 @Helium 0x1a9002, D1 @Helium 0x1a8fc5, D2 @Helium 0x1a8f85).
  throw new Error(
    "HgcExposure vtable slot *0x18 (release) @Helium 0x1a8fc5 / D0 @0x1a9002 not yet transcribed",
  );
}
